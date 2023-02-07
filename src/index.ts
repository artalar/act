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
  var queueVersion = -1
  var subscriberVersion = -1
  var state: any
  var theAct: ActValue<any> & ActComputed<any>

  if (typeof init === 'function') {
    var deps: Dependencies = []
    // @ts-expect-error expected properties declared below
    theAct = () => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (
          queueVersion === QUEUE_VERSION &&
          SUBSCRIBER !== null &&
          theAct._s.size !== 0
        ) {
          // reuse leafs of current subscriber
          for (const s of theAct._s) {
            for (const { _s } of s._v)
              if (_s.size !== _s.add(SUBSCRIBER).size)
                SUBSCRIBER._v.push(theAct)
            break
          }
        } else {
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
        }
        queueVersion = QUEUE_VERSION
        subscriberVersion = SUBSCRIBER_VERSION
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

        if (QUEUE.push(theAct._s) === 1) {
          QUEUE_VERSION++
          act.notify.schedule?.()
        }

        theAct._s = new Set()
      }

      if (
        SUBSCRIBER !== null &&
        theAct._s.size !== theAct._s.add(SUBSCRIBER).size
      ) {
        SUBSCRIBER._v.push(theAct)
      }

      // @ts-expect-error can't type a structure
      DEPS?.push(theAct, state)

      return state
    }
  }

  theAct.subscribe = (cb) => {
    var queueVersion = -1
    var lastState: unknown = {}

    // @ts-expect-error `var` could be more performant than `const`
    var subscriber: Subscriber = () => {
      if (queueVersion !== QUEUE_VERSION) {
        try {
          queueVersion = QUEUE_VERSION

          for (var { _s } of subscriber._v.splice(0)) _s.delete(subscriber)

          SUBSCRIBER = subscriber

          SUBSCRIBER_VERSION++

          if (theAct() !== lastState) cb((lastState = state))
        } finally {
          SUBSCRIBER = null
        }
      }
    }
    subscriber._v = []

    subscriber()
    theAct._s.add(subscriber)

    return () => {
      theAct._s.delete(subscriber)
      if (theAct._s.size === 0) {
        for (var { _s } of subscriber._v) _s.delete(subscriber)
      }
    }
  }

  theAct._s = new Set()

  return theAct
}
act.notify = () => {
  var iterator = QUEUE

  QUEUE = []

  for (var subscribers of iterator) {
    for (var subscriber of subscribers) subscriber()
  }
}
act.notify.schedule = () => Promise.resolve().then(act.notify)
