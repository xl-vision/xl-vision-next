import { env } from '@xl-vision/utils';

export type EventObject = Window | HTMLElement | Document;

export type EventMap<T extends EventObject> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : T extends HTMLElement
  ? HTMLElementEventMap
  : never;

export type EventType<
  T extends EventObject,
  K extends keyof EventMap<T>
> = K extends keyof WindowEventMap
  ? WindowEventMap[K]
  : K extends keyof DocumentEventMap
  ? DocumentEventMap[K]
  : K extends keyof HTMLElementEventMap
  ? HTMLElementEventMap[K]
  : never;

export type Listener<T extends EventObject, K extends keyof EventMap<T>> = (
  this: T,
  ev: EventType<T, K>,
  options?: boolean | AddEventListenerOptions,
) => any;

export const on = <E extends EventObject, K extends keyof EventMap<E>>(
  element: E,
  type: K,
  listener: Listener<E, K>,
  options?: boolean | AddEventListenerOptions,
) => {
  if (env.isServer) {
    return;
  }

  element.addEventListener(type as any, listener as any, options);
};

export const off = <E extends EventObject, K extends keyof EventMap<E>>(
  element: E,
  type: K,
  listener: Listener<E, K>,
  options?: boolean | AddEventListenerOptions,
) => {
  if (env.isServer) {
    return;
  }

  element.removeEventListener(type as any, listener as any, options);
};
