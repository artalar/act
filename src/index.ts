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
let batchQueue: Stated['__subscribers'] = new Set()

/** stack-based parent ref to silently link nodes */
let parentDeps: null | Dependencies = null

export const stated = <T>(state: T): Stated<T> => {
  return {
    get() {
      parentDeps?.push({ dep: this, state })

      return state
    },

    set(newState) {
      if (!Object.is(state, newState)) {
        state = newState

        if (batchQueue.size === 0) notify.schedule()

        this.__subscribers.forEach((subscriber) => batchQueue.add(subscriber))

        this.__subscribers = new Set()
      }

      return state
    },

    // @ts-expect-error
    subscribe,

    __subscribers: new Set(),
  }
}

export const computed = <T>(
  computed: () => T,
  equal?: (prev: T, next: T) => boolean,
): Computed<T> => {
  let state: T
  let lastDeps: typeof parentDeps = []

  return {
    get() {
      if (lastDeps !== parentDeps) {
        if (parentDeps) lastDeps = parentDeps
        const prevDeps = parentDeps
        parentDeps = null

        try {
          if (
            this.__dependencies.length === 0 ||
            this.__dependencies.some(({ dep, state }) => dep.get() !== state)
          ) {
            parentDeps = this.__dependencies = []
            const newState = computed()
            if (
              state === undefined ||
              equal === undefined ||
              !equal(state, newState)
            ) {
              state = newState
            }
          }

          prevDeps?.push({ dep: this, state })
        } finally {
          parentDeps = prevDeps
        }
      }

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
    const newState = this.get()

    un()
    subscriber.__stateds = []

    const stack = new Set<Computed['__dependencies']>()
    const add = (dep: Stated | Computed) => {
      if ('__dependencies' in dep) stack.add(dep.__dependencies)
      else {
        dep.__subscribers.add(subscriber)
        subscriber.__stateds.push(dep)
      }
    }
    add(this)
    for (const deps of stack) {
      for (const { dep } of deps) add(dep)
    }

    if (newState !== lastState) cb((lastState = newState))
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
  const iterator = batchQueue

  batchQueue = new Set()

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
