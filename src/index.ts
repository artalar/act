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
type Dependencies =
  | []
  | [
      /** Pulled dependency */
      act: Act,
      /** The dependency returned state */
      state: unknown,
    ]

// #endregion

/** subscribers from all touched signals */
var QUEUE: Array<Set<Subscriber>> = []

/** global queue cache flag */
var QUEUE_VERSION = 0

/** current subscriber during invalidation */
var SUBSCRIBER: null | Subscriber = null

/** global subscriber pull cache flag */
var SUBSCRIBER_VERSION = 0

/** stack-based parent ref to silently link nodes */
var DEPS: null | Dependencies = null

// @ts-expect-error `var` is more performant, but broke the types
export var act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(initState: T): ActValue<T>
  notify: {
    (): void
    schedule?: null | (() => void)
  }
} = (init, equal) => {
  var version = -1
  var state: any
  var theAct: ActValue<any> & ActComputed<any>

  if (typeof init === 'function') {
    var deps: Dependencies = []
    // @ts-expect-error expected properties declared below
    theAct = () => {
      if (version !== SUBSCRIBER_VERSION) {
        version = SUBSCRIBER_VERSION

        var prevDeps = DEPS
        DEPS = null

        try {
          var isActual = deps.length > 0
          for (var i = 0; isActual && i < deps.length; i += 2) {
            // @ts-expect-error can't type a structure
            isActual = Object.is(deps[i + 1], deps[i]())
          }

          if (!isActual) {
            DEPS = deps = []

            var newState = init()

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

      // @ts-expect-error can't type a structure
      DEPS?.push(theAct, state)

      return state
    }
  } else {
    state = init
    // @ts-expect-error expected properties declared below
    theAct = (newState) => {
      if (newState !== undefined && !Object.is(newState, state)) {
        // mark all computeds dirty
        ++SUBSCRIBER_VERSION

        state = newState

        if (QUEUE.push(theAct._s) === 1) act.notify.schedule?.()

        theAct._s = new Set()
      }

      if (version !== SUBSCRIBER_VERSION && SUBSCRIBER !== null) {
        version = SUBSCRIBER_VERSION
        theAct._s.add(SUBSCRIBER)
        SUBSCRIBER._v.push(theAct)
      }

      // @ts-expect-error can't type a structure
      DEPS?.push(theAct, state)

      return state
    }
    theAct._s = new Set()
  }

  theAct.subscribe = (cb) => {
    var queueVersion = -1
    var lastState: unknown = {}

    // @ts-expect-error `var` could be more performant than `const`
    var subscriber: Subscriber = () => {
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

    var un = () => {
      for (var signal of subscriber._v) {
        signal._s.delete(subscriber)
      }
    }

    subscriber()

    return un
  }

  return theAct
}
act.notify = () => {
  QUEUE_VERSION++

  var iterator = QUEUE

  QUEUE = []

  for (var subscribers of iterator) {
    for (var subscriber of subscribers) subscriber()
  }
}
act.notify.schedule = () => Promise.resolve().then(act.notify)
