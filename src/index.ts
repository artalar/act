interface Pubs
  extends Array<{ p: /* publisher */ () => any; s: /* state */ any }> {}
export interface ActValue<T> {
  (state?: T): T
  subscribe(cb: (state: T) => any): () => void
}
export interface ActComputed<T> {
  (): T
  subscribe(cb: (state: T) => any): () => void
}

let root: null | (() => any) = null
let pubs: null | Pubs = null
let version = 0
let queue: Array<Array<() => any>> = []

export let act: {
  <T>(computed: () => T, equal?: (prev: T, next: T) => boolean): ActComputed<T>
  <T>(state: T): ActValue<T>
} = (s, equal?: (prev: any, next: any) => boolean) => {
  let _version = -1
  let p: ActValue<any> | ActComputed<any>

  if (typeof s === 'function') {
    let _pubs: Pubs = []
    let computed = s as () => any
    // @ts-expect-error
    p = () => {
      if (_version !== version) {
        let subPubs = pubs
        pubs = null
        if (_pubs.length === 0 || _pubs.some((el) => el.p() !== el.s)) {
          pubs = _pubs = []
          let newState = computed()
          if (_version === -1 || !equal?.(s, newState)) s = newState
        }
        pubs = subPubs

        _version = version
      }

      pubs?.push({ p, s })

      return s
    }
  } else {
    let listeners: Array<() => any> = []
    // @ts-expect-error
    p = (newState?: any) => {
      if (newState !== undefined && newState !== s) {
        s = newState
        queue.push(listeners)
        listeners = []
        if (queue.length === 1) for (const cb of queue.pop()!) cb()
      }

      pubs?.push({ p, s })

      if (root && !listeners.includes(root)) listeners.push(root)

      return s
    }
  }

  p.subscribe = (cb) => {
    let effect = () => {
      if (cb) {
        version++
        root = effect
        cb(p())
        root = null
      }
    }
    effect()

    return () => {
      // @ts-expect-error
      cb = null
    }
  }

  return p
}

export let batch = (cb: () => any) => {
  queue.push([])
  cb()
  for (let listeners of queue) for (let cb of listeners) cb()
  queue = []
}
