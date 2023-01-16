interface Subscriber {
  (): void
  _v: Array<ActValue>
}

interface Subscribable<T = any> {
  subscribe(cb: (state: T) => any): () => void
}

export interface ActValue<T = any> extends Subscribable<T> {
  (state?: T): T
  _s: Set<Subscriber>
}
export interface ActComputed<T = any> extends Subscribable<T> {
  (): T
}

// a subscriber - source of truth
let root: null | Subscriber = null
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
    // @ts-expect-error
    a = (newState) => {
      if (newState !== undefined && newState !== s) {
        s = newState

        if (queue.push(a._s) === 1) Promise.resolve().then(act.notify)

        a._s = new Set()
      }

      pubs?.push(a, s)

      if (_version !== version) {
        _version = version
        if (root) {
          a._s.add(root)
          root._v.push(a)
        }
      }

      return s
    }
    a._s = new Set()
  }

  a.subscribe = (cb) => {
    let lastQueue: any = cb
    let lastState: any = cb
    // @ts-expect-error
    let subscriber: Subscriber = () => {
      if (lastQueue !== queue) {
        lastQueue = queue

        ++version

        let prevRoot = root
        root = subscriber

        un()
        subscriber._v = []

        try {
          if (lastState !== a()) cb((lastState = s))
        } finally {
          root = prevRoot
        }
      }
    }
    subscriber._v = []

    const un = () => {
      for (const val of subscriber._v) {
        val._s.delete(subscriber)
      }
    }

    subscriber()

    // TODO next tick?
    return un
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
