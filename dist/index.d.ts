/// <reference types="jquery" />
declare const EventEmitter: any
declare class SiteInstance extends EventEmitter {
  static apps: {}
  constructor(name?: string)
  domReady(): void
  initLiveReload(): boolean
  setGlobalState(state: any, reset: any): void
  findWidgets(name: any, el: any): any[]
  findWidget(name: any, el: any): any
  getAllWidgets(el: any): any[]
  triggerAllWidgets(methodName: any, target?: any, ...args: any[]): void
  getWidgetDefs(el: any): any
  initWidgets(targetEl: any): void
  reportError(...args: any[]): void
  propsToSave(): string[]
  saveWidgetProps(self: any, mixins: any, name: any): {}
  prepWidgetExtensions(name: any, def: any): any
  widget(name: any, def: any, explicitBase: any): void
  preloadImages(srcs: any, timeout: any, callback: any): void
  preloadContent(els: any, timeout: any, callback: any): void
  getURLPath(input: any): any
  resizeToFit(
    width: any,
    height: any,
    viewportWidth: any,
    viewportHeight: any,
    cover: any
  ): {}
  forceResizeWindow(): void
  preloadPages(): void
  getRefreshes(target: any): any
  doRefreshes(
    result: any
  ): {
    swapping: {
      items: any[]
      swap: () => Promise<unknown>
    }
    leaving: {
      items: any[]
      $items: any
    }
    entering: {
      items: any[]
      $items: any
    }
  }
  restoreScroll(fn: any): Promise<unknown>
  getContent(url: any, callback: any, isPreload: any): void
  goToURL(url: any, dontPush: any): void
  preloadWidgets(targetEl: any, callback: any): void
  generateReplaceState(
    s: any
  ): {
    scrollY: number
    scrollX: number
  }
  transitionWidgetsIn(
    targetEl: any,
    newState: any,
    oldState: any,
    callback: any
  ): void
  transitionWidgetsOut(
    targetEl: any,
    newState: any,
    oldState: any,
    destroy: any,
    callback: any
  ): void
  wrapXHRInner(): void
  initXHRPageSystem(): void
  handleXHRLinks(targetEl: any): void
  disableClickingFor(duration: any): void
  callAPI(method: any, args: any, callback: any): Promise<unknown>
}
declare type ThisOverload<El> = {
  element: JQuery<El>
}
interface BaseWidget<El, T> {
  use?(...mixins: any[]): any
  _create?(): any
  _transitionIn?(): Promise<any> | number
  _transitionOut?(): Promise<any> | number
  _destroy?(): any
  _ready?(): any
  _preloadWidget?(next: () => any): Promise<any>
  xhrPageWillLoad?(
    urlPath: string,
    url: string,
    direction: 'back' | 'forward'
  ): boolean
  [k: string]: any
}
export declare function Widget<
  El extends HTMLElement,
  T extends BaseWidget<El, T>
>(
  name: string,
  def: T
): {
  isWidget: boolean
  name: string
  def: T
}
export declare function Site(instance?: string): any
export declare namespace Site {
  var $: any
  var jQuery: any
}
export default SiteInstance
//# sourceMappingURL=index.d.ts.map
