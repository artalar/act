interface Pubs extends Array<{ a: /* act */ () => any; s: /* state */ any }> {}

interface Effect {
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
let root: null | Effect = null
// a subscriber to unsubscribe
let unroot: null | Effect = null
// list of a publishers from a computed in prev stack step
let pubs: null | Pubs = null
// global `dirty` flag used to cache visited nodes during it invalidation by a subscriber
let version = 0
// effects queue for a batch, also used as a cache key of a transaction
let queue: Array<Array<() => any>> = []

// @ts-expect-error
export let act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(state: T): ActValue<T>

  notify: () => void
} = (s, equal?: (prev: any, next: any) => boolean): any => {
  let _version = -1
  let a: ActValue<any> & ActComputed<any>

  if (typeof s === 'function') {
    let _pubs: Pubs = []
    let computed = s as () => any
    // @ts-expect-error
    a = () => {
      if (_version !== version || !root) {
        let prevPubs = pubs
        pubs = null

        if (_pubs.length === 0 || _pubs.some((el) => el.a() !== el.s)) {
          pubs = _pubs = []
          let newState = computed()
          if (_version === -1 || !equal?.(s, newState)) s = newState
        }

        pubs = prevPubs

        _version = version
      }

      pubs?.push({ a, s })

      return s
    }
  } else {
    let effects: any[] = []
    // @ts-expect-error
    a = (newState) => {
      if (newState !== undefined && newState !== s) {
        s = newState

        if (queue.push(effects) === 1) Promise.resolve().then(act.notify)

        effects = []
      }

      pubs?.push({ a, s })

      if (_version !== version) {
        _version = version
        if (unroot) effects.splice(effects.indexOf(unroot), 1)
        else if (root) effects.push(root)
      }

      return s
    }
  }

  a.subscribe = (cb) => {
    let lastQueue: any = cb
    let lastState: any = cb
    let effect: Effect = () => {
      if (lastQueue !== queue) {
        lastQueue = queue

        ++version

        let prevRoot = root
        root = effect

        try {
          if (lastState !== a()) cb((lastState = s))
        } finally {
          root = prevRoot
        }
      }
    }
    effect()

    // TODO next tick?
    return () => {
      ++version
      unroot = effect
      a()
      unroot = null
    }
  }

  return a
}
act.notify = () => {
  const iterator = queue

  queue = []

  for (let effects of iterator) {
    for (let effect of effects) effect()
  }
}
