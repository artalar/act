export let createAct = () => {
  type Pubs = Array<{ p: /* publisher */ () => any; s: /* state */ any }>

  let root: null | (() => any) = null
  let pubs: null | Pubs = null
  let version = 0
  let queue: null | Array<Array<() => any>> = null

  let act: {
    <T>(computed: () => T, filter?: (prev: T, next: T) => boolean): () => T
    <T>(state: T): (state?: T) => T
  } = (s, filter?: (prev: any, next: any) => boolean) => {
    let _version = -1
    if (typeof s === 'function') {
      let _pubs: Pubs = []
      let computed = s as () => any
      let p = () => {
        root ??= (version++, p)

        if (_version !== version) {
          let subPubs = pubs
          pubs = []
          if (_pubs.length === 0 || _pubs.some((el) => el.p() !== el.s)) {
            let newState = computed()
            if (_version === -1 || !filter || filter(s, newState)) s = newState
            _pubs = pubs
          }
          pubs = subPubs

          _version = version

          if (root === p) root = null
        }

        pubs?.push({ p, s })

        return s
      }

      return p
    }

    let listeners: Array<() => any> = []

    let p = (newState?: any) => {
      if (newState !== undefined && newState !== s) {
        s = newState
        let dirty = listeners
        listeners = []
        if (!queue?.push(dirty)) for (let cb of dirty) cb()
      }

      if (root && !listeners.includes(root)) listeners.push(root)

      pubs?.push({ p, s })

      _version = version

      return s
    }

    return p
  }

  let batch = (cb: () => any) => {
    queue = []
    cb()
    for (let listeners of queue) for (let cb of listeners) cb()
    queue = null
  }

  return { act, batch }
}
