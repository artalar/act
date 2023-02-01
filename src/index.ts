// symbol-observable polyfill from redux https://github.com/reduxjs/redux/blob/master/src/utils/symbol-observable.ts
// @ts-expect-error "Symbol" maybe undefined on legacy platforms
const $$observable = /* #__PURE__ */ (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

// #region TYPES

interface Subscriber {
  (): void
  _v: Array<ActValue>
}

/** Base mutable reactive primitive, a leaf of reactive graph */
export interface ActValue<T = unknown> {
  (newState?: T): T
  subscribe(cb: (state: T) => void): () => void
  _s: Set<Subscriber>
}
export interface ActComputed<T = unknown> {
  (): T
  subscribe(cb: (state: T) => void): () => void
}

export type Act<T = unknown> = ActValue<T> | ActComputed<T>

/** List of used dependencies to memorize computed function */
interface Dependencies
  extends Array<{
    /** Pulled dependency */
    act: Act
    /** The dependency returned state */
    state: unknown
  }> {}

// #endregion

/** subscribers from all touched signals */
let QUEUE: Array<Set<Subscriber>> = []

/** global queue cache flag */
let QUEUE_VERSION = 0

/** current subscriber during invalidation */
let SUBSCRIBER: null | Subscriber = null

/** global subscriber pull cache flag */
let SUBSCRIBER_VERSION = 0

/** stack-based parent ref to silently link nodes */
let DEPS: null | Dependencies = null

// @ts-expect-error `let` is more performant, but broke the types
export let act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(initState: T): ActValue<T>
  notify: () => void
} = (init, equal) => {
  let version = -1
  let state: any
  let theAct: ActValue<any> & ActComputed<any>

  if (typeof init === 'function') {
    let deps: Dependencies = []
    // @ts-expect-error expected properties declared below
    theAct = () => {
      if (version !== SUBSCRIBER_VERSION) {
        version = SUBSCRIBER_VERSION

        let prevDeps = DEPS
        DEPS = null

        try {
          if (deps.length === 0 || deps.some((el) => el.state !== el.act())) {
            DEPS = deps = []

            let newState = init()

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

      DEPS?.push({ act: theAct, state })

      return state
    }
  } else {
    state = init
    // @ts-expect-error expected properties declared below
    theAct = (newState) => {
      if (newState !== undefined && newState !== state) {
        // mark all computeds dirty
        ++SUBSCRIBER_VERSION

        state = newState

        if (QUEUE.push(theAct._s) === 1)
          Promise.resolve().then(act.notify)

        theAct._s = new Set()
      }

      if (version !== SUBSCRIBER_VERSION && SUBSCRIBER !== null) {
        version = SUBSCRIBER_VERSION
        theAct._s.add(SUBSCRIBER)
        SUBSCRIBER._v.push(theAct)
      }

      DEPS?.push({ act: theAct, state })

      return state
    }
    theAct._s = new Set()
  }

  theAct.subscribe = (cb) => {
    let queueVersion = -1
    let lastState: unknown = Symbol()

    // @ts-expect-error `let` could be more performant than `const`
    let subscriber: Subscriber = () => {
      if (queueVersion !== QUEUE_VERSION) {
        try {
          queueVersion = QUEUE_VERSION

          un()
          subscriber._v = []

          SUBSCRIBER = subscriber

          SUBSCRIBER_VERSION++

          if (theAct() !== lastState) cb((lastState = state))
        } finally {
          SUBSCRIBER = null
        }
      }
    }
    subscriber._v = []

    let un = () => {
      for (let signal of subscriber._v) {
        signal._s.delete(subscriber)
      }
    }

    subscriber()

    return un
  }
  
  theAct[$$observable] = {
    subscribe(observer: unknown) {
      const unsubscribe = theAct.subscribe((state) => {
        // @ts-expect-error assume observer is spec-compliant
        if (observer && observer.next) observer.next(state)
      })
        
      return { unsubscribe }
    },

    [$$observable]() {
      return this
    }
  }

  return theAct
}
act.notify = () => {
  QUEUE_VERSION++

  let iterator = QUEUE

  QUEUE = []

  for (let subscribers of iterator) {
    for (let subscriber of subscribers) subscriber()
  }
}
