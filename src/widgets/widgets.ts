import { ElementType, ElementTypeOrNull } from '../general/types/element-type'
import { Widget, WidgetTypeWithType } from './widget-type'
import { traverseDepth } from '../general/tree/traverse-depth'
import { Loadable } from '../general/async/loadable'
import { traverse } from '../general/tree/traverse'
import { Site } from '../site'
import { fromEntries } from '../general/object/from-entries'
import { Router } from '../router'

export const IS_WIDGET = Symbol('isWidget')
type WidgetType = WidgetTypeWithType

type WidgetFiberOrNull = WidgetFiber | null

type WidgetFiber = {
  parent: WidgetFiberOrNull
  children: WidgetFiber[]
  element: ElementType
  context: { [key: string]: any }
  instances: WidgetType[]
  isRoot: boolean
}

export class Widgets {
  /* Keep track of running parts */
  static runtime = {
    fibers: new WeakMap<Element, WidgetFiber>(),
    baseContext: {},
    tree: null as WidgetFiber,
    container: null as ElementTypeOrNull,
    constructors: {} as { [key: string]: WidgetType },
  }

  static isWidgetElement(el: ElementType) {
    return el.matches(`[widget]`)
  }

  static isWidget(instance: any): instance is WidgetType {
    return typeof instance === 'object' && instance[IS_WIDGET]
  }

  static isWidgetConstructor(type: any): type is WidgetType['constructor'] {
    return typeof type === 'function' && type[IS_WIDGET]
  }

  static createFiber(el: ElementType): WidgetFiber {
    const prevFiber = this.getFiberForElement(el)
    if (prevFiber) return prevFiber

    return {
      element: el,
      instances: [],
      context: {},
      isRoot: Site.isContainer(el),
      children: [],
      parent: null,
    }
  }

  static createTreeFromLeaf(el: ElementType) {
    let target = el

    while (
      !Site.isContainer(target) &&
      !Widgets.isWidgetElement(target) &&
      !Router.isOutlet(target)
    ) {
      target = target.parent
    }

    let fiber = Widgets.getFiberForElement(target) as WidgetFiber

    fiber.children = this.createTree({ children: fiber.children })
  }

  static createTree(el?: ElementType, { useCached = true } = {}) {
    if (!el) {
      el = Site.container()
    }

    if (useCached) {
      const tree = this.runtime.fibers.get(el)
      if (tree) return tree
    }

    const formTree = (
      element: ElementType,
      tree: WidgetFiber = this.createFiber(element)
    ) => {
      for (let child of element.children) {
        if (this.isWidgetElement(child)) {
          const fiber = this.createFiber(child)
          fiber.parent = tree
          if (!tree.children.includes(fiber)) {
            tree.children.push(fiber)
          }
          formTree(child, fiber)
        } else {
          formTree(child, tree)
        }
      }
      return tree
    }

    const tree = formTree(el)

    return tree
  }

  /*
  Start just imports all the widget files from their pre known paths. 
  Then calls Widgets.init on the container
  */
  static start({
    widgets = [] as any[],
    container = null as ElementTypeOrNull,
  } = {}) {
    this.runtime.container = container || Site.container()

    /* Throw if the container doesn't exit */
    if (!this.runtime.container) {
      const noContainerMsg = `Widgets container did not exist, expected element, got ${this.runtime.container}`
      throw new Error(noContainerMsg)
    }

    for (let mod of widgets) {
      if (this.isWidgetConstructor(mod)) {
        Widgets.register(mod)
      }
    }

    /* This can be called as many times as you like on the same dom node. It will only init widgets once */
    Widgets.init(this.runtime.container)
  }

  /* Get a widget constructor by type */
  static getWidgetConstructor(type: string) {
    return this.runtime.constructors[type]
  }

  /* 
  Check if a fiber has a widget instance of type
  Elements can only have one instance of each widget type attached to them
  */
  static hasInstanceOfType(fiber: WidgetFiber, type: string) {
    return fiber.instances.find(x => x.type === type)
  }

  /* 
  Used for initialising a single widget by dom node
  At the moment this only works if the dom node exists in the tree
  But in the future it could work by recursing up the dom tree until it finds an existing fiber
  and then initializing down from there
  */
  static initWidget(element: ElementType) {
    let fiber = this.getFiberForElement(element)

    if (fiber === null) {
      throw new Error(
        `Initting widgets outside of a tree isn't implemented yet`
      )
    }

    const types = (fiber.element.getAttribute('widget') || '').split(',')

    for (let type of types) {
      type = type.trim()

      const widgetAlreadyExists = this.hasInstanceOfType(fiber, type)
      if (widgetAlreadyExists) continue

      const WidgetFactory = this.getWidgetConstructor(type)

      /* Warn if the widget definition doesnt exist */
      if (!WidgetFactory) {
        const widgetTypeDoesntExistMsg = `Widget type "${type}" does not exist\n`
        console.warn(widgetTypeDoesntExistMsg, fiber.element)
        return
      }

      const instance = new WidgetFactory(fiber.element)
      fiber.instances.push(instance)
    }
  }

  /* Init is called from root -> leaves */
  static init(container: ElementType) {
    /* Get the closest parent that is a widget or page-content */
    const parentNode = container.closest('#site, [widget]')
    const tree = this.createTree(container, { useCached: false })

    /* 
    We have to figure out what part of the parent tree
    we have to replace using the parentnode
    */
    this.runtime.tree = tree

    traverse(tree, fiber => {
      /* Add node to runtime fibers */
      this.runtime.fibers.set(fiber.element, fiber)

      if (!fiber.isRoot) {
        this.initWidget(fiber.element)
      }

      fiber.instances.forEach(instance => instance.init && instance.init())
    })

    this.mount(tree.element, tree)
  }

  /* Mount is called from leaves -> root ala componentDidMount */
  static mount(node: ElementType, tree = this.createTree(node)) {
    traverseDepth(tree, fiber => {
      fiber.instances.forEach(instance => {
        instance.mount()
      })
    })
  }

  /* unmount is called from root -> leaves */
  static unmount(node: ElementType, tree = this.createTree(node)) {
    traverse(tree, fiber => {
      while (fiber.instances.length) {
        const instance = fiber.instances.shift()
        instance?.unmount()
      }
    })
  }

  /* Preload is called from root -> leaves */
  static preload(element: ElementType = Site.container()) {
    const promises: Promise<any>[] = []
    const container = Widgets.isWidgetElement(element)
      ? element
      : element.closest('#site, [widget]')

    const tree = this.createTree(element)

    traverse(tree, fiber => {
      for (let instance of fiber.instances) {
        if (!instance.preload) continue

        const instanceLoads = instance.preload()

        if (Array.isArray(instanceLoads)) {
          promises.push(...instanceLoads)
        } else if (typeof instanceLoads === 'object') {
          const entries = Object.entries(instanceLoads)
          const proms = entries.map(([k, v]) => v)
          promises.push(...proms)

          /* 
          When preload returns an object
          the result is mixed into the widget instance so it can access
          on this[property]
          */
          Promise.allSettled(proms).then(result => {
            Object.assign(
              instance,
              fromEntries(entries.map(([k]) => [k, result[k]]))
            )
          })
        } else {
          promises.push(instanceLoads)
        }
      }
    })

    return new Loadable(promises)
  }

  /* Register a new widget type */
  static register(widgetType: WidgetType) {
    this.runtime.constructors[widgetType.type] = widgetType
  }

  static getFiberForElement(
    el: HTMLElement | Element | null
  ): WidgetFiber | null {
    if (!el) return null
    return this.runtime.fibers.get(el) || null
  }

  static setBaseContext(ctx: { [k: string]: any }) {
    this.runtime.baseContext = ctx
  }

  static getWidgetElements(page: HTMLElement) {
    return page.querySelectorAll('[widget]')
  }
}

window.Widgets = Widgets
