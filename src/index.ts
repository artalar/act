interface Subscriber {
  (): void
}

interface Subscribable<T = any> {
  subscribe(cb: (state: T) => any): () => void
}

export interface ActValue<T = any> extends Subscribable<T> {
  (state?: T): T
}
export interface ActComputed<T = any> extends Subscribable<T> {
  (): T
}

// a subscriber - source of truth
let root: null | Subscriber = null
// a subscriber to unsubscribe
let unroot: null | Subscriber = null
// list of a publishers from a computed in prev stack step
// we store a structure here (i=dep, i+1=depState)
let pubs: null | Array<any> = null
// global `dirty` flag used to cache visited nodes during it invalidation by a subscriber
let version = 0
// subscribers queue for a batch, also used as a cache key of a transaction
let queue: Array<Set<() => any>> = []

// @ts-expect-error
export let act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(state: T): ActValue<T>

  notify: () => void
} = (s, equal?: (prev: any, next: any) => boolean): any => {
  let _version = -1
  let a: ActValue<any> & ActComputed<any>

  if (typeof s === 'function') {
    let _pubs: Array<any> = []
    let computed = s as () => any
    // @ts-expect-error
    a = () => {
      if (_version !== version || root === null) {
        let prevPubs = pubs
        pubs = null

        let isActual = _pubs.length > 0
        for (let i = 0; isActual && i < _pubs.length; i += 2) {
          isActual = _pubs[i]() === _pubs[i + 1]
        }

        if (!isActual) {
          pubs = _pubs = []
          let newState = computed()
          if (_version === -1 || equal === undefined || !equal(s, newState)) {
            s = newState
          }
        }

        pubs = prevPubs

        _version = version
      }

      pubs?.push(a, s)

      return s
    }
  } else {
    let subscribers = new Set<any>()
    // @ts-expect-error
    a = (newState) => {
      if (newState !== undefined && newState !== s) {
        s = newState

        if (queue.push(subscribers) === 1) Promise.resolve().then(act.notify)

        subscribers = new Set()
      }

      pubs?.push(a, s)

      if (_version !== version) {
        _version = version
        if (unroot) subscribers.delete(unroot)
        else if (root) subscribers.add(root)
      }

      return s
    }
  }

  a.subscribe = (cb) => {
    let lastQueue: any = cb
    let lastState: any = cb
    let subscriber: Subscriber = () => {
      if (lastQueue !== queue) {
        lastQueue = queue

        ++version

        let prevRoot = root
        root = subscriber

        try {
          if (lastState !== a()) cb((lastState = s))
        } finally {
          root = prevRoot
        }
      }
    }
    subscriber()

    // TODO next tick?
    return () => {
      ++version
      unroot = subscriber
      a()
      unroot = null
    }
  }

  return a
}
act.notify = () => {
  const iterator = queue

  queue = []

  for (let subscribers of iterator) {
    for (let subscriber of subscribers) subscriber()
  }
}
