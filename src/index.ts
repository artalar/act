// #region TYPES

/** Base mutable reactive primitive, a leaf of reactive graph */
export interface Stated<T = unknown> {
  get(): T

  set(newValue: T): T

  subscribe(cb: (state: T) => void): Unsubscribe

  /** Side-effects */
  __subscribers: Set<Subscriber>
}

/** Readonly reactive memoized selector */
export interface Computed<T = unknown> {
  get(): T

  subscribe(cb: (state: T) => void): Unsubscribe

  /** List of used dependencies to memorize computed function */
  __dependencies: Dependencies
}

interface Unsubscribe {
  (): void
}

interface Subscriber {
  (): void
  __stateds: Array<Stated>
}

interface Dependencies
  extends Array<{
    /** Pulled dependency */
    dep: Stated | Computed
    /** The dependency returned state */
    state: unknown
  }> {}

// #endregion

/** subscribers from all touched states */
let QUEUE: Stated['__subscribers'] = new Set()

/** stack-based parent ref to silently link nodes */
let DEPS: null | Dependencies = null

/** current invalidated subscriber */
let SUBSCRIBER: null | Subscriber = null

export const stated = <T>(state: T): Stated<T> => ({
  get() {
    DEPS?.push({ dep: this, state })

    if (SUBSCRIBER && !this.__subscribers.has(SUBSCRIBER)) {
      this.__subscribers.add(SUBSCRIBER)
      SUBSCRIBER.__stateds.push(this)
    }

    return state
  },

  set(newState) {
    if (!Object.is(state, newState)) {
      state = newState

      if (QUEUE.size === 0) notify.schedule()

      this.__subscribers.forEach((subscriber) => QUEUE.add(subscriber))

      this.__subscribers = new Set()
    }

    return state
  },

  // @ts-expect-error
  subscribe,

  __subscribers: new Set(),
})

export const computed = <T>(
  computed: () => T,
  equal?: (prev: T, next: T) => boolean,
): Computed<T> => {
  let state: T
  // visited mark during invalidation from a subscriber
  let lastStateds: Subscriber['__stateds'] = []

  return {
    get() {
      if (lastStateds !== SUBSCRIBER?.__stateds) {
        const prevDeps = DEPS
        DEPS = null

        try {
          if (
            this.__dependencies.length === 0 ||
            this.__dependencies.some((el) => el.dep.get() !== el.state)
          ) {
            DEPS = this.__dependencies = []

            const newState = computed()

            if (
              equal === undefined ||
              // first call
              state === undefined ||
              !equal(state, newState)
            ) {
              state = newState
            }
          }
        } finally {
          DEPS = prevDeps
        }

        if (SUBSCRIBER) lastStateds = SUBSCRIBER.__stateds
      }

      DEPS?.push({ dep: this, state })

      return state
    },

    // @ts-expect-error
    subscribe,

    __dependencies: [],
  }
}

function subscribe(this: Stated | Computed, cb: (state: unknown) => void) {
  let lastState: unknown = Symbol()

  const subscriber: Subscriber = () => {
    un()
    subscriber.__stateds = []

    SUBSCRIBER = subscriber

    const newState = this.get()

    if (newState !== lastState) {
      cb((lastState = newState))
    }

    SUBSCRIBER = null
  }
  subscriber.__stateds = []

  const un = () => {
    for (const stated of subscriber.__stateds) {
      stated.__subscribers.delete(subscriber)
    }
  }

  subscriber()

  return un
}

export const notify = () => {
  const iterator = QUEUE

  QUEUE = new Set()

  for (let subscriber of iterator) subscriber()
}
notify.schedule = () => {
  Promise.resolve().then(notify)
}

// -----------------

export interface ActValue<T = any> extends Stated<T> {
  (state?: T): T
}
export interface ActComputed<T = any> extends Computed<T> {
  (): T
}

// @ts-expect-error
export let act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(state: T): ActValue<T>
  notify: typeof notify
} = (s: any, equal) => {
  if (typeof s === 'function') {
    const a = computed(s, equal)
    return Object.assign(a.get.bind(a), a)
  }
  const a = stated(s)
  return Object.assign(
    (newState?: any) => (newState === undefined ? a.get() : a.set(newState)),
    a,
  )
}
act.notify = notify
