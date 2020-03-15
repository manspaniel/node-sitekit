type Source = Element | Window | Animation

const DELIMITER = ' '

export type Listener<E, T> = (e: E & { target: T }) => any
type Disposer = () => any

export type GetEventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : T extends HTMLElement
  ? HTMLElementEventMap
  : T extends Animation
  ? AnimationEventMap
  : T extends HTMLMediaElement
  ? HTMLMediaElementEventMap
  : string

export function on<T extends EventTarget, M = keyof GetEventMap<T>>(
  element: T,
  eve: keyof GetEventMap<T>,
  callback: Listener<GetEventMap<T>[M], T>
): Disposer {
  /* Split events by space */
  const events = Array.isArray(eve) ? eve : [eve]

  /* Subscribe to all the events! */
  events.forEach(event => element.addEventListener(event, callback))

  /* Return a disposer */
  return () =>
    events.forEach(event => element.removeEventListener(event, callback))
}
