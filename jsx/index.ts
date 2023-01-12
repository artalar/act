export var h = (tag: any, props: Record<string, any>, ...children: any[]) => {
  if (tag === hf) return children

  if (typeof tag === 'function') tag(props ?? {}, children)

  var element = document.createElement(tag)

  for (var k in props) {
    var prop = props[k]
    if (typeof prop?.subscribe === 'function') {
      var un = prop.subscribe((v: any) =>
        !un || element.isConnected ? (element[k] = v) : un(),
      )
    } else {
      element[k] = prop
    }
  }

  var walk = (child: any) => {
    if (Array.isArray(child)) child.forEach(walk)
    else {
      if (typeof child?.subscribe === 'function') {
        var textNode = document.createTextNode('') as ChildNode,
          un = child.subscribe((v: any) => {
            if (un && !textNode.isConnected) un()
            else {
              if (v instanceof Element) {
                if (un) {
                  element.insertBefore(v, textNode)
                  textNode.remove()
                }
                textNode = v
              } else {
                textNode.textContent = v
              }
            }
          })
        element.appendChild(textNode)
      } else {
        element.appendChild(
          child?.nodeType ? child : document.createTextNode(String(child)),
        )
      }
    }
  }

  children.forEach(walk)

  return element
}

/** Fragment */
export var hf = () => {}
