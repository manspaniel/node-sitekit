import Subject from '../reactive/subject'

type LoadableEvents = {
  progress: [
    {
      percent: number
      start: number
      time: number
    }
  ]
  complete: [
    {
      percent: 1
      start: number
      time: number
    }
  ]
}
export class Loadable extends Subject<LoadableEvents> {
  promises: Promise<any>[]
  loaded: number

  start: number = Date.now()
  timeout?: string | NodeJS.Timeout
  complete = false

  constructor(resources: Promise<any>[], timeout = 0) {
    super()

    this.promises = resources
    this.loaded = 0

    for (let promise of this.promises) {
      promise.then(arg => {
        this.loaded++
        this.emitProgress()
        return arg
      })
    }

    if (timeout) {
      this.timeout = setTimeout(() => {
        this.emitComplete()
      }, timeout)
    }
  }

  finished() {
    return new Promise(resolve => {
      if (this.complete) {
        resolve()
      } else {
        this.once('complete', update => {
          resolve()
        })
      }
    })
  }

  private emitComplete() {
    if (this.complete) return
    this.complete = true
    this.emit('complete', {
      percent: 1,
      start: this.start,
      time: Date.now() - this.start,
    })
  }

  private emitProgress() {
    const update = {
      percent: this.loaded / this.promises.length,
      start: this.start,
      time: Date.now() - this.start,
    }

    this.emit('progress', update)

    if (update.percent === 1) {
      this.emitComplete()
    }
  }
}
