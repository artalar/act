// #region TYPES

/** Base mutable reactive primitive, a leaf of reactive graph */
export interface Signal<T = unknown> {
  value: T

  subscribe(cb: (state: T) => void): Unsubscribe

  /** Side-effects */
  __subscribers: Set<Subscriber>
}

/** Readonly reactive memoized selector */
export interface Computed<T = unknown> {
  readonly value: T

  subscribe(cb: (state: T) => void): Unsubscribe

  /** List of used dependencies to memorize computed function */
  __dependencies: Dependencies
}

interface Unsubscribe {
  (): void
}

interface Subscriber {
  (): void

  __signals: Array<Signal>
}

interface Dependencies
  extends Array<{
    /** Pulled dependency */
    dep: Signal | Computed
    /** The dependency returned state */
    state: unknown
  }> {}

// #endregion

/** subscribers from all touched signals */
let QUEUE = new Set<Subscriber>()

/** stack-based parent ref to silently link nodes */
let DEPS: null | Dependencies = null

/** current invalidated subscriber */
let SUBSCRIBER: null | Subscriber = null

/** version of traverse (subscription pull) for computed memoization */
let VERSION = 0

export let signal = <T>(state: T): Signal<T> => ({
  get value() {
    DEPS?.push({ dep: this, state: state })

    if (SUBSCRIBER !== null && !this.__subscribers.has(SUBSCRIBER)) {
      this.__subscribers.add(SUBSCRIBER)
      SUBSCRIBER.__signals.push(this)
    }

    return state
  },

  set value(newState) {
    ++VERSION

    state = newState

    if (QUEUE.size === 0) notify.schedule()

    for (const subscriber of this.__subscribers) QUEUE.add(subscriber)

    this.__subscribers = new Set()
  },

  subscribe,

  __subscribers: new Set(),
})

export let computed = <T>(
  computed: () => T,
  equal?: (prev: T, next: T) => boolean,
): Computed<T> => {
  let version = -1
  let state: T

  return {
    get value() {
      if (version !== VERSION) {
        version = VERSION

        let prevDeps = DEPS
        DEPS = null

        try {
          if (
            this.__dependencies.length === 0 ||
            this.__dependencies.some((el) => el.state !== el.dep.value)
          ) {
            DEPS = this.__dependencies = []

            let newState = computed()

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
      }

      DEPS?.push({ dep: this, state: state })

      return state
    },

    subscribe,

    __dependencies: [],
  }
}

function subscribe<T>(this: Signal<T> | Computed<T>, cb: (state: T) => void) {
  let lastState: unknown = Symbol()

  const subscriber: Subscriber = () => {
    try {
      VERSION++

      un()
      subscriber.__signals = []

      SUBSCRIBER = subscriber

      let newState = this.value

      if (newState !== lastState) cb((lastState = newState))
    } finally {
      SUBSCRIBER = null
    }
  }
  subscriber.__signals = []

  let un = () => {
    for (let signal of subscriber.__signals) {
      signal.__subscribers.delete(subscriber)
    }
  }

  subscriber()

  return un
}

export let effect = (cb: () => any) => computed(cb).subscribe(() => {})

export const notify = () => {
  let iterator = QUEUE

  QUEUE = new Set()

  for (let subscriber of iterator) subscriber()
}
notify.schedule = () => {
  Promise.resolve().then(notify)
}
