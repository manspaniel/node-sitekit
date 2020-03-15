// const Symbol = str => str + '_' + (Math.random() * 10).toFixed(3)
const subject = Symbol('subject')

type Callback<Args extends [] = any[], Result = any> = (...args: Args) => Result

type SubjectProperties<Types> = {
  index: number
  listeners: {
    [k in keyof Types]: {
      [l: string]: Callback<Types[k]>
    }
  }
  cancels: {
    [k: string]: Callback
  }
  key: () => string
}

type GetElementType<T extends Array<any>> = T extends (infer U)[] ? U : never

export default class Subject<EventTypes = { [key: string]: Array<any> }> {
  [subject]: SubjectProperties<EventTypes>

  constructor() {
    this[subject] = {
      index: 0,
      listeners: {},
      cancels: {},
      key() {
        return `listener_${this[subject].index++}`
      },
    } as SubjectProperties<EventTypes>

    // Bind all the methods
    this.on = this.on.bind(this)
    this[subject].key = this[subject].key.bind(this)
    this.emit = this.emit.bind(this)
    this.once = this.once.bind(this)
    this.destroy = this.destroy.bind(this)
  }

  /* Listen to  */
  on<Key extends keyof EventTypes>(
    nameOrCallback: Key | Callback,
    fn?: Callback<EventTypes[Key]>
  ) {
    let name = nameOrCallback as keyof EventTypes
    let callback = fn as Callback | Callback<EventTypes[Key]>
    if (!fn && typeof nameOrCallback === 'function') {
      callback = nameOrCallback as Callback
      /* Listen to all events */
      name = (subject as unknown) as keyof EventTypes
    }

    // Every event listener is given it's own key
    const key = this[subject].key()

    const eventNames =
      typeof name === 'string'
        ? (name.split(' ') as (keyof EventTypes)[])
        : [name]

    for (const eventName of eventNames) {
      // If this is the first listener of type eventName then listeners[eventName] will be empty
      if (!this[subject].listeners[eventName])
        this[subject].listeners[eventName] = {}

      // Add the listener to the listener object
      this[subject].listeners[eventName][key] = callback
    }

    // Cancel function deletes the listener and itself from Subject
    let cancelled = false
    let cancels = () => {
      if (cancelled) return
      cancels = () => {}
      cancelled = true

      for (const eventName of eventNames) {
        delete this[subject].listeners[eventName][key]
        delete this[subject].cancels[key]

        if (!Object.keys(this[subject].listeners[eventName]).length) {
          delete this[subject].listeners[eventName]
        }
      }
    }

    // Add cancel to the subject array
    this[subject].cancels[key] = cancels

    // Return the event diposer
    return cancels
  }

  emit<T extends keyof EventTypes>(name: T, ...args: EventTypes[T]) {
    // @ts-ignore
    if (name !== subject) {
      // @ts-ignore
      this.emit(subject, ...args)
    }
    // If this even is in the listeners object
    if (this[subject].listeners[name]) {
      return Object.values(this[subject].listeners[name]).map(fn => fn(...args))
    }
  }

  getHandlers<T extends keyof EventTypes>(name: T) {
    return {
      get: () => {
        const handlers: Callback<EventTypes[T]>[] = []
        for (const key in this[subject].listeners[name]) {
          handlers.push(this[subject].listeners[name][key])
        }
        return handlers
      },
      map: (fn: Callback<[Callback<EventTypes[T]>, string?]>) => {
        const results = []
        for (const key in this[subject].listeners[name]) {
          const handler = this[subject].listeners[name][key]
          results.push(fn(handler, key))
        }
        return results
      },
      forEach: (fn: Callback<[Callback<EventTypes[T]>, string?]>) => {
        for (const key in this[subject].listeners[name]) {
          const handler = this[subject].listeners[name][key]
          fn(handler, key)
        }
      },
      reduce: (
        fn: Callback<[EventTypes[T][0], Callback<EventTypes[T]>, string?]>,
        val?: EventTypes[T][0]
      ) => {
        let prev = val
        for (const key in this[subject].listeners[name]) {
          const handler = this[subject].listeners[name][key]
          prev = fn(prev, handler, key)
        }
      },
    }
  }

  reduce<T extends keyof EventTypes>(
    name: T,
    ...args: EventTypes[T]
  ): EventTypes[T][0] {
    const [value, ...rest] = args
    let prev
    if (this[subject].listeners[name]) {
      return this.getHandlers(name).reduce((memo, fn) => {
        const v = fn(memo, ...rest)
        if (typeof v !== 'undefined') {
          prev = v
          return v
        } else {
          return prev
        }
      }, value)
    }

    return value
  }

  async asyncReduce<T extends keyof EventTypes>(
    name: T,
    ...args: EventTypes[T]
  ): EventTypes[T][0] {
    const [value, ...rest] = args
    let prev
    if (this[subject].listeners[name]) {
      return Object.values(this[subject].listeners[name]).reduce((last, fn) => {
        const v = fn(last, ...rest)
        if (typeof v !== 'undefined') {
          last = v
          return v
        }
        return last
      }, value)
    }

    return value
  }

  add<T extends keyof EventTypes>(eventName: T, fn: Callback<EventTypes[T]>) {
    return this.on(eventName, fn)
  }

  once<T extends keyof EventTypes>(name: T, fn: Callback<EventTypes[T]>) {
    // Use var to hoist variable (not sure if needed)
    var cancel = this.on(name, (...args) => {
      if (cancel) cancel()
      fn(...args)
    })
  }

  destroy() {
    Object.values(this[subject].cancels).forEach(fn => fn())
  }
}
