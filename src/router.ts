import { createBrowserHistory, History } from 'history'
import Subject from './general/reactive/subject'
import { on } from './general/element/on'
import { Widgets } from './widgets/widgets'
import { ElementTypeOrNull, ElementType } from './general/types/element-type'
import { Site } from './site'

const history = createBrowserHistory()

/* 
Router's jobs
  - Scroll restore
*/
type Events = {
  beforeNavigate: [boolean, URL]
  beforeNavigateAway: [boolean, URL]
  navigationCancelled: []
  prepareHTML: [string]
  prepareDOM: [HTMLElement]
  linkClick: [Event & { target: HTMLAnchorElement }]
}

type LoadEvents = {
  start: []
  loadedPage: []
  parsedPage: []
  initedWidgets: []
  widgetsPreLoading: []
  widgetsPreLoaded: []
  end: []
  progress: []
}

function toURL(href: URL | string) {
  if (typeof href === 'string') {
    /* This is an absolute complete domain */
    if (href.indexOf('http') === 0) {
      return new URL(href)
    } else {
      /* This is a relative domain */
      return new URL(href, window.location.host)
    }
  } else {
    return href
  }
}

function isLocalLink(href: string | URL) {
  return toURL(href).host === location.host
}

const externalTarget = /_blank/
function isLocalTarget(el: HTMLAnchorElement) {
  return !externalTarget.test(el.target)
}

class Link {
  el: HTMLAnchorElement
  router: Router
  onClick!: () => any

  constructor(el: HTMLAnchorElement, router: Router) {
    this.el = el
    this.router = router
    this.mount()
  }

  mount() {
    this.onClick = on(this.el, 'click', e => {
      /* Check if the link's url should be opened in the current tab */
      const isLocal = isLocalLink(e.target.href) && isLocalTarget(e.target)
      /* Add the isLocal variable to the event */
      let eve = e as typeof e & { isLocal: boolean }

      /* Patch preventDefault */
      const originalPreventDefault = eve.preventDefault
      let prevented = false
      eve.preventDefault = () => {
        prevented = true
      }

      /* Let widgets prevent default */
      this.router.emit('linkClick', eve)

      if (!prevented) {
        originalPreventDefault.apply(eve)

        if (isLocal) {
          this.router.navigate(e.target.href)
        }
      }

      /* Else the link will just navigate like a normal link */
    })
  }

  unmount() {
    this.onClick()
  }
}

class Router extends Subject<Events> {
  runtime = {
    routlets: [],
    links: [],
  }

  container!: ElementType
  started: boolean = false
  links: WeakMap<HTMLAnchorElement, any> = new Map()
  loader = new Subject<LoadEvents>()

  options!: {
    ga?: {
      code?: string
      event?: string
      property?: string
    }
  }

  constructor() {
    super()

    /* Debugging */
    if (__DEV__) {
      for (let [key, value] in Object.entries(this)) {
        if (typeof value === 'function') {
          if (key !== 'start') {
            this[key] = (...args: any[]) => {
              if (!this.started) {
                throw new Error(
                  `You must call ".start()" on a router before calling any of it's methods`
                )
              }
              value.apply(this, args)
            }
          }
        }
      }
    }
  }

  start({ ga = {} } = {}) {
    /* Always bound to document.body */
    this.container = document.body
    this.started = false

    this.options = {
      ga,
    }

    window.router = this

    this.handleLinks(this.container)
  }

  /* 
    Transforms link clicks into router navigations
  */
  handleLinks(container: ElementType = this.container) {
    const links = container.querySelectorAll<HTMLAnchorElement>('a[href]')

    for (const el of links) {
      /* Don't rebind links that have already been bound */
      if (this.links.get(el)) continue
      const link = new Link(el, this)
      this.links.set(el, link)
    }
  }

  /* Probably should provide some filters here */
  async navigate(
    href: string | URL,
    options: { state?: { [k: string]: any } } = {}
  ) {
    const { state } = options || {}
    const url = toURL(href)
    const isLocal = isLocalLink(url)

    const canNavigate = await this.asyncReduce('beforeNavigate', true, url)

    if (canNavigate) {
      if (isLocal) {
        return this.changeContent(url)
      } else {
        const canNavigateAway = await this.asyncReduce(
          'beforeNavigateAway',
          true,
          url
        )

        if (canNavigateAway) {
          /* Cause the browser to go to the different page */
          location.href = url.href
        }
      }
    }
  }

  scrollTo(y: number, x: number = 0) {
    window.scrollTo(x, y)
  }

  toHash(hashString: string, shouldScroll = true) {
    const hash = hashString.indexOf('#') === 0 ? hashString : '#' + hashString

    const beginning: [number, number] = [window.scrollX, window.scrollY]
    window.location.hash = hash
    const target: [number, number] = [window.scrollX, window.scrollY]
    window.scrollTo(...beginning)

    /* If you need to trigger a reflow uncomment this */
    /* document.body.offsetLeft */
    if (shouldScroll) {
      window.scrollTo({
        left: target[0],
        top: target[1],
        behavior: 'smooth',
      })
    }
  }

  /*
  Has to be called in the page change animation
  */
  restoreScroll() {}

  async reduceHTML(htmlString: string) {
    return this.asyncReduce('prepareHTML', htmlString)
  }

  async preparePage(htmlString: string) {
    const html = await this.reduceHTML(htmlString)
    const doc = document.createElement('html')
    // @ts-ignore
    doc.innerHTML = html
    return this.asyncReduce('prepareDOM', doc)
  }

  static isOutlet(el: ElementType) {
    return el.matches(`router-outlet`)
  }

  getOutlets(el: ElementType | Document = this.container) {
    return el.querySelectorAll(`router-outlet`)
  }

  updateOutlets(current, next) {
    const prevOutlets = this.getOutlets(current)
    const nextOutlets = this.getOutlets(next)

    prevOutlets.forEach((node: Element) => {
      for (let child of node.children as HTMLElement[]) {
        child.dataset['routerRemove'] = 'true'
      }
    })

    return {
      async add() {
        nextOutlets.forEach((outlet, i) => {
          prevOutlets[i].append(...outlet.children)
        })
      },
      async remove() {
        prevOutlets.forEach(outlet => {
          outlet.querySelectorAll(`[data-router-remove]`).forEach(el => {
            Widgets.unmount(el)
            el.remove()
          })
        })
      },
    }
  }

  updateHead(current: HTMLElement | Document, next: HTMLElement) {
    const head = current.querySelector('head') as HTMLHeadElement
    const nextHead = next.querySelector('head') as HTMLHeadElement

    console.log(next)

    for (const node of nextHead.children) {
      switch (node.nodeType) {
        case 'script': {
          if (node) {
          }
        }
        case 'title': {
          const titleTag = head.querySelector('title')
          titleTag.text = node.text
        }
        case 'meta': {
          const name = node.getAttribute('name')
          const content = node.getAttribute('content')

          const el = head.querySelector(`meta[name=${name}]`)

          if (!el) {
            head.appendChild(node)
            return
          }

          if (el.getAttribute('content') !== content) {
            el.setAttribute('content', content)
          }
        }
      }
    }
  }

  // updateBody(current, next) {
  //   const body = document.body
  //   const nextBody = nextDomNode.querySelector('body') as HTMLBodyElement
  // }

  async changeContent(url: URL) {
    this.loader.emit('start')

    const response = await fetch(url.href)
    this.loader.emit('loadedPage')

    const htmlString = await response.text()
    const nextDocument = await this.preparePage(htmlString)

    const outlets = this.updateOutlets(
      this.container,
      Site.container(nextDocument)
    )

    const add = async () => {
      outlets.add()
    }

    const remove = async () => {
      outlets.remove()
      //
      this.updateHead(document, nextDocument)
    }

    // this.loader.emit('parsedPage')

    // Widgets.init(nextDomNode)
    // this.loader.emit('initedWidgets')

    // const loadingPromises: Promise<any>[] = []
    // Widgets.preload()
    // this.loader.emit('widgetsPreLoading')

    // this.loader.emit('progress')

    // this.loader.emit('end')
  }

  async swap(
    previous: HTMLElement,
    next: HTMLElement,
    adder: () => any,
    remover: () => any,
    scroll: () => any,
    container: HTMLElement
  ) {
    next.style.opacity = '0'
    /* 
    Adds the next page to the dom
    And initializes all the widgets
    */
    next.style.opacity = '0'
    next.style.position = 'absolute'

    await adder()

    await watch(
      previous.animate({
        opacity: [1, 0],
      })
    )

    /* 
    Removes the old content and restores scroll
    Should be called after add in order to allow the scroll position to be restored
    */
    await remover()

    await scroll()

    await watch(
      next.animate({
        opacity: [0, 1],
      })
    )

    next.style.position = ''
    next.style.opacity = ''

    /* When this function returns it calls all the transitionIn callbacks */
  }
}

function watch(animation: Animation) {
  return new Promise((resolve, reject) => {
    const onCancelled = on(animation, 'cancel', () => {
      reject()
      onCancelled()
      onFinished()
    })
    const onFinished = on(animation, 'finish', () => {
      resolve()
      onCancelled()
      onFinished()
    })
  })
}

const router = new Router()

export { router as Router }
