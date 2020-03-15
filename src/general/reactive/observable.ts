interface Observer<T> {
  next: Listener<T>
  complete?: Listener
  error?: Listener<Error>
}
type Listener<T = any> = (value: T) => any
type Cleanup = () => any
interface Dict<T> {
  [key: string]: T
}
export interface ListenerGroup {
  next: Dict<Listener>
  error: Dict<Listener>
  complete: Dict<Listener>
}

class Observable<T = any> {
  private index: number = 0
  private streamSource: (observer: Observable<T>) => Cleanup
  private subscribed: boolean = false
  private activeListeners = 0
  private unsubscribeFromSource: Cleanup = () => {}
  private listeners: ListenerGroup = {
    next: {},
    error: {},
    complete: {}
  }
  private cancels: Dict<Cleanup> = {}

  constructor(source: Observable['streamSource']) {
    this.streamSource = source
    this.next = this.next.bind(this)
    this.complete = this.complete.bind(this)
    this.error = this.error.bind(this)
  }

  private getKey() {
    return 'k' + this.index++
  }

  emit(key: 'next' | 'error' | 'complete', val?: T | Error) {
    for (const k in this.listeners[key]) {
      this.listeners[key][k](val)
    }
  }

  /* Emit the next value */
  next(value: T) {
    this.emit('next', value)
  }

  error(error: Error) {
    this.emit('error', error)
  }

  /* Emit an end event to everything */
  complete() {
    this.emit('complete')
    this.destroy()
  }

  destroy() {
    for (const k in this.cancels) {
      this.cancels[k]()
    }
  }

  onDestroy (fn:Cleanup) {
    const key = this.getKey()

    this.cancels[key] = () => {
      delete this.cancels[key]
      fn()
    }
  }

  /* 
  This is called when a observer unsubscribes
  if it was the last remaining observer then it unsubscribes from the source
  */
  cleanup() {
    if (!this.activeListeners) {
      this.unsubscribeFromSource()
    }
  }

  /*
  Subscribe can be passed either a 
  Listener: (nextVal) => {} 
    or an
  Observer: { next: nextVal => {}, error: err => {}, }
  */
  subscribe(fnOrObserver: Listener<T> | Observer<T>) {
    if (!this.subscribed) {
      this.unsubscribeFromSource = this.streamSource(this)
      this.subscribed = true
    }
    const key = this.getKey()

    if (isObserver(fnOrObserver)) {
      const objKeys = Object.keys(fnOrObserver) as (keyof Observer<T>)[]
      this.activeListeners += 1

      objKeys.forEach(objKey => {
        this.listeners[objKey][key] = fnOrObserver[objKey]
      })

      const cancel = () => {
        this.activeListeners -= 1
        objKeys.forEach(objKey => {
          delete this.listeners[objKey][key]
        })
        delete this.cancels[key]
        this.cleanup()
      }

      this.cancels[key] = cancel

      return { unsubscribe: cancel, observer: fnOrObserver }
    } else {
      this.listeners.next[key] = fnOrObserver
      this.activeListeners += 1

      const cancel = () => {
        this.activeListeners -= 1
        delete this.listeners.next[key]
        delete this.cancels[key]
        this.cleanup()
      }

      this.cancels[key]

      return { unsubscribe: cancel, observer: fnOrObserver }
    }
  }
}

function isObserver<T>(obj: any): obj is Observer<T> {
  if (typeof obj === 'object' && obj.next) {
    return true
  }
}

function isListener<T>(fn: any): fn is Listener<T> {
  if (typeof fn === 'function') {
    return true
  }
}

/* Same as regular observable except it always emits the last value */
export class BehaviourSubject<T = any> extends Observable<T> {
  lastNext: T

  next(value: T) {
    this.emit('next', value)
    this.lastNext = value
  }

  /* Very similar to observable except it sends the most recent value on subscribe */
  subscribe(fnOrObserver: Listener<T> | Observer<T>) {
    const observer = super.subscribe(fnOrObserver)
    if (isObserver(observer.observer)) {
      observer.observer.next(this.lastNext)
    } else if (isListener(fnOrObserver)) {
      fnOrObserver(this.lastNext)
    }
    return observer
  }
}

interface ChannelAPI<C> {
  onSubscribe: (channel: C) => any
  onUnsubscribe: (channel: C) => any
  destroy: () => any
}

function isChannelAPI<C>(arg): arg is ChannelAPI<C> {
  return Boolean(arg.destroy)
}

export class ChannelledObservable<C = any, V = any> {
  private index: number = 0
  private streamSource: (observer: ChannelledObservable<C, V>) => Cleanup | ChannelAPI<C>
  private subscribed: boolean = false
  private activeListeners = 0
  private unsubscribeFromSource: Cleanup | ChannelAPI<C> = () => {}
  channels: Map<C, ListenerGroup> = new Map()
  private cancels: Dict<Cleanup> = {}

  constructor(source: ChannelledObservable['streamSource']) {
    this.streamSource = source
    this.next = this.next.bind(this)
    this.complete = this.complete.bind(this)
    this.error = this.error.bind(this)
  }

  private getKey() {
    return 'k' + this.index++
  }

  emit(channel: C, key: 'next' | 'error' | 'complete', val?: V | Error) {
    const c = this.channels.get(channel)
    for (const k in c[key]) {
      c[key][k](val)
    }
  }

  next(channel: C, value: V) {
    this.emit(channel, 'next', value)
  }
  error(channel: C, error: Error) {
    this.emit(channel, 'error', error)
  }
  complete(channel: C) {
    this.emit(channel, 'complete')
  }

  destroy() {
    for (const k in this.cancels) {
      this.cancels[k]()
    }
  }

  onDestroy (fn:Cleanup) {
    const key = this.getKey()

    this.cancels[key] = () => {
      delete this.cancels[key]
      fn()
    }
  }

  /* 
  This is called when a observer unsubscribes
  if it was the last remaining observer then it unsubscribes from the source
  */
  cleanup(channel: C) {
    if (isChannelAPI(this.unsubscribeFromSource)) this.unsubscribeFromSource.onUnsubscribe(channel)

    if (!this.activeListeners) {
      isChannelAPI(this.unsubscribeFromSource) ? this.unsubscribeFromSource.destroy() : this.unsubscribeFromSource()
    }
  }

  /*
  Subscribe can be passed either a 
  Listener: (nextVal) => {} 
    or an
  Observer: { next: nextVal => {}, error: err => {}, }
  */
  subscribe(channelKey: C, fnOrObserver: Listener<V> | Observer<V>) {
    if (!this.subscribed) {
      this.unsubscribeFromSource = this.streamSource(this)
      this.subscribed = true
    }

    let channel = this.channels.get(channelKey)
    const key = this.getKey()

    if (!channel) {
      channel = { next: {}, error: {}, complete: {} }
      this.channels.set(channelKey, channel)
    }

    if (isChannelAPI(this.unsubscribeFromSource)) {
      this.unsubscribeFromSource.onSubscribe(channelKey)
    }

    /*  */
    if (isObserver(fnOrObserver)) {
      const objKeys = Object.keys(fnOrObserver) as (keyof Observer<V>)[]
      this.activeListeners += 1

      objKeys.forEach(objKey => {
        channel[objKey][key] = fnOrObserver[objKey]
      })

      const cancel = () => {
        this.activeListeners -= 1
        const c = this.channels.get(channelKey)
        objKeys.forEach(objKey => {
          delete c[objKey][key]
        })
        delete this.cancels[key]
        this.cleanup(channelKey)
      }

      this.cancels[key] = cancel

      return { unsubscribe: cancel, observer: fnOrObserver }
    }

    if (isListener(fnOrObserver)) {
      channel.next[key] = fnOrObserver
      this.activeListeners += 1

      const cancel = () => {
        this.activeListeners -= 1
        delete this.channels.get(channelKey).next[key]
        delete this.cancels[key]
        this.cleanup(channelKey)
      }

      this.cancels[key]

      return { unsubscribe: cancel, observer: fnOrObserver }
    }
  }
}

export default Observable
