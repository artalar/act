const isObserver = (
  thing: any,
): thing is { subscribe: (cb: (v: any) => any) => any } =>
  typeof thing?.subscribe === 'function'

export const h = (tag: any, props: Record<string, any>, ...children: any[]) => {
  const type = typeof tag

  if (tag === hf || isObserver(tag)) return tag

  if (type === 'function') {
    props ??= {}
    props.children = children
    return tag(props)
  }

  const element = document.createElement(tag)

  for (const k in props) {
    const v = props[k]
    if (isObserver(v)) {
      var un = v.subscribe((v) =>
        !un || element.isConnected ? (element[k] = v) : un(),
      )
    } else {
      element[k] = v
    }
  }

  const walk = (child: any) => {
    if (Array.isArray(child)) child.forEach(walk)
    else {
      if (isObserver(child)) {
        const anAct = child
        child = document.createTextNode('')
        var un = anAct.subscribe((v) => {
          if (un && !child.isConnected) {
            un()
          } else {
            if (v instanceof Element) {
              if (!un) {
                child = v
              } else {
                element.insertBefore(v, child)
                child.remove()
                child = v
              }
            } else {
              child.textContent = v
            }
          }
        })
      }

      if (!child?.nodeType) child = document.createTextNode(String(child))

      element.appendChild(child)
    }
  }

  children.forEach(walk)

  return element
}

export const hf = () => {}
