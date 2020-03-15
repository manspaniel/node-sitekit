export interface IteratorYieldResult<TYield> {
  done?: false
  value: TYield
}

export interface IteratorReturnResult<TReturn> {
  done: true
  value: TReturn
}

export interface Iterator<T, TReturn = any, TNext = undefined> {
  // Takes either 0 or 1 arguments - doesn't accept 'undefined'
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>
  return?(value?: TReturn): IteratorResult<T, TReturn>
  throw?(e?: any): IteratorResult<T, TReturn>
}

export interface Generator<T = unknown, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>
  return(value: TReturn): IteratorResult<T, TReturn>
  throw(e: any): IteratorResult<T, TReturn>
  [Symbol.iterator](): Generator<T, TReturn, TNext>
}
