import { Widgets, IS_WIDGET } from './widgets'
import { ElementType } from '../general/types/element-type'
import { parseDataset } from '../general/element/parse-dataset'
import { on, GetEventMap, Listener } from '../general/element/on'

export class WidgetType {
  element: HTMLElement
  isCurrentlyMounted = false
  data: { [key: string]: any };

  /* Help identify widgets */
  [IS_WIDGET] = true
  static [IS_WIDGET] = true

  /* 
  Bunch of functions to call on unmount
  */
  private disposables: Set<() => any> = new Set()

  constructor(element: HTMLElement) {
    this.element = element
    this.bind = this.bind.bind(this)

    this.bind.apply(this)

    this.data = {}
    if (this.element.dataset) {
      this.data = parseDataset(this.element)
    }
  }

  /* Mount is called at the end of initialization */
  /* The super method will always be called before the actual method */
  mount() {
    this.isCurrentlyMounted = true
    console.log('super mount')
  }
  unmount() {
    this.isCurrentlyMounted = false
    this.disposables.forEach(fn => fn())
  }

  /* 
  Preload is called after initializing but before mounting 
  if you return an object of promises the result will be mixed into your class
  eg. 
  preload: () => ({ THREE: import('three'), swiper: import('swiper') })
  -> this.THREE and this.swiper
  */
  preload?: () => Promise<any> | Promise<any>[] | { [k: string]: Promise<any> }
  init?(): any
  transitionIn?: () => Promise<any> | number
  transitionOut?: () => Promise<any> | number
  canPageChange?: (path: string) => boolean | Promise<boolean>
  get context() {
    return Widgets.getFiberForElement(this.element).context
  }

  /* 
  Anything bound with this.on will be automatically
  removed when the element is unmout
  */
  on<T = WidgetType['element'], M = keyof GetEventMap<T>>(
    event: keyof GetEventMap<T>,
    callback: Listener<GetEventMap<T>[M], T>
  ): () => any
  on<T, M = keyof GetEventMap<T>>(
    element: T,
    event: keyof GetEventMap<T>,
    callback: Listener<GetEventMap<T>[M], T>
  ): () => any
  on<T = WidgetType['element'], M = keyof GetEventMap<T>>(
    element: T | keyof GetEventMap<T>,
    event: keyof GetEventMap<T> | (() => any),
    callback?: Listener<GetEventMap<T>[M], T>
  ) {
    if (typeof element === 'string') {
      return this.dispose(on(this.element, element, event))
    } else {
      return this.dispose(on(element, event, callback))
    }
  }

  dispose(fn: () => any) {
    const off = () => {
      fn()
      this.disposables.delete(off)
    }
    this.disposables.add(off)
    return off
  }

  bind() {
    if (this.preload) {
      this.preload = this.preload.bind(this)
    }
    if (this.mount) {
      this.mount = this.mount.bind(this)
    }
    if (this.unmount) {
      this.unmount = this.unmount.bind(this)
    }
    if (this.init) {
      this.init = this.init.bind(this)
    }
    if (this.on) {
      this.on = this.on.bind(this)
    }
    if (this.transitionIn) {
      this.transitionIn = this.transitionIn.bind(this)
    }
    if (this.transitionOut) {
      this.transitionOut = this.transitionOut.bind(this)
    }
    if (this.canPageChange) {
      this.canPageChange = this.canPageChange.bind(this)
    }
  }
}

function write(obj, prop, val) {
  Object.defineProperty(obj, prop, { writable: true, value: val })
  Object.defineProperty(obj, prop, { writable: false })
}

function withPrev<T, V extends (...args: any[]) => any>(val: T, fn: V) {
  return (...args: any[]) => {
    return fn(val, ...args)
  }
}

/* Used solely in the below union time */
class WithType {
  static type: string
  type: string
}
export type WidgetTypeWithType = WidgetType & WithType

function Widget(type: string) {
  const cls = class WidgetTypeWithType extends WidgetType {
    type = type
    static type = type

    constructor(element: HTMLElement) {
      super(element)

      this.mount = withPrev(this.mount, mount => {
        super.mount()
        mount && mount()
      })

      this.unmount = withPrev(this.unmount, unmount => {
        unmount && unmount()
        super.unmount()
      })
    }
  }

  write(cls, 'name', `Widget_${type}`)

  return cls
}

export { Widget }
