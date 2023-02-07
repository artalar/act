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
  _s: Set<Subscriber>
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

/** subscribers from all touched acts */
var QUEUE = new Set<Subscriber>()

/** global queue cache flag */
var QUEUE_VERSION = 0

/** current subscriber during invalidation */
var SUBSCRIBER: null | Subscriber = null

/** stack-based parent ref to silently link nodes */
var DEPS: null | Dependencies = null

var link = (valueAct: ActValue) =>
  valueAct._s.size === valueAct._s.add(SUBSCRIBER!).size ||
  SUBSCRIBER!._v.push(valueAct)

// @ts-expect-error `var` is more performant, but broke the types
export var act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(initState: T): ActValue<T>
  notify: {
    (): void
    schedule?: null | (() => void)
  }
} = (init, equal) => {
  var queueVersion = -1
  var state: any
  var theAct: ActValue<any> & ActComputed<any>

  if (typeof init === 'function') {
    var lastSubscriber: typeof SUBSCRIBER = null
    var deps: Dependencies = []
    // @ts-expect-error expected properties declared below
    theAct = () => {
      if (queueVersion !== QUEUE_VERSION) {
        var prevDeps = DEPS
        DEPS = null

        try {
          var isActual = deps.length > 0
          for (var i = 0; isActual && i < deps.length; i += 2) {
            // @ts-expect-error can't type a structure
            isActual = Object.is(deps[i + 1], deps[i]())
          }

          if (!isActual) {
            ;(DEPS = deps).length = 0

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

        queueVersion = QUEUE_VERSION
        lastSubscriber = SUBSCRIBER
      } else if (
        SUBSCRIBER !== null &&
        lastSubscriber !== null &&
        lastSubscriber !== SUBSCRIBER
      ) {
        // reuse leafs of the last subscriber
        lastSubscriber._v.forEach(link)
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
        state = newState

        QUEUE_VERSION++

        if (QUEUE.size === 0) act.notify.schedule?.()

        for (var subscriber of theAct._s) QUEUE.add(subscriber)
        theAct._s.clear()
      }

      if (SUBSCRIBER !== null) link(theAct)

      // @ts-expect-error can't type a structure
      DEPS?.push(theAct, state)

      return state
    }
  }

  theAct.subscribe = (cb) => {
    var lastState: unknown = {}

    // @ts-expect-error `var` could be more performant than `var`
    var subscriber: Subscriber = () => {
      try {
        for (var { _s } of subscriber._v) _s.delete(subscriber)
        subscriber._v.length = 0

        SUBSCRIBER = subscriber

        if (theAct() !== lastState) cb((lastState = state))
      } finally {
        SUBSCRIBER = null
      }
    }
    subscriber._v = []

    subscriber()

    return () => {
      for (var { _s } of subscriber._v) _s.delete(subscriber)
    }
  }

  theAct._s = new Set()

  return theAct
}
act.notify = () => {
  var iterator = QUEUE

  QUEUE = new Set()

  for (var subscriber of iterator) subscriber()
}
act.notify.schedule = () => Promise.resolve().then(act.notify)
