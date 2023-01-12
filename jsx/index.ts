export namespace JSXInternal {
  export interface ActLike<T> {
    (state?: T): T
    subscribe(cb: (state: T) => any): () => void
  }

  export interface IntrinsicAttributes {
    key?: any
  }

  export type ElementType<P = any> =
    | {
        [K in keyof IntrinsicElements]: P extends IntrinsicElements[K]
          ? K
          : never
      }[keyof IntrinsicElements]
    | ComponentType<P>

  export interface ElementAttributesProperty {
    props: any
  }

  export interface ElementChildrenAttribute {
    children: any
  }

  export type DOMCSSProperties = {
    [key in keyof Omit<
      CSSStyleDeclaration,
      | 'item'
      | 'setProperty'
      | 'removeProperty'
      | 'getPropertyValue'
      | 'getPropertyPriority'
    >]?: string | number | null | undefined
  }
  export type AllCSSProperties = {
    [key: string]: string | number | null | undefined
  }
  export interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
    cssText?: string | null
  }

  export type TargetedEvent<
    Target extends EventTarget = EventTarget,
    TypedEvent extends Event = Event,
  > = Omit<TypedEvent, 'currentTarget'> & {
    readonly currentTarget: Target
  }

  export type TargetedAnimationEvent<Target extends EventTarget> =
    TargetedEvent<Target, AnimationEvent>
  export type TargetedClipboardEvent<Target extends EventTarget> =
    TargetedEvent<Target, ClipboardEvent>
  export type TargetedCompositionEvent<Target extends EventTarget> =
    TargetedEvent<Target, CompositionEvent>
  export type TargetedDragEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    DragEvent
  >
  export type TargetedFocusEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    FocusEvent
  >
  export type TargetedKeyboardEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    KeyboardEvent
  >
  export type TargetedMouseEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    MouseEvent
  >
  export type TargetedPointerEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    PointerEvent
  >
  export type TargetedTouchEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    TouchEvent
  >
  export type TargetedTransitionEvent<Target extends EventTarget> =
    TargetedEvent<Target, TransitionEvent>
  export type TargetedUIEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    UIEvent
  >
  export type TargetedWheelEvent<Target extends EventTarget> = TargetedEvent<
    Target,
    WheelEvent
  >

  export interface EventHandler<E extends TargetedEvent> {
    /**
     * The `this` keyword always points to the DOM element the event handler
     * was invoked on. See: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Event_handlers#Event_handlers_parameters_this_binding_and_the_return_value
     */
    (this: never, event: E): void
  }

  export type AnimationEventHandler<Target extends EventTarget> = EventHandler<
    TargetedAnimationEvent<Target>
  >
  export type ClipboardEventHandler<Target extends EventTarget> = EventHandler<
    TargetedClipboardEvent<Target>
  >
  export type CompositionEventHandler<Target extends EventTarget> =
    EventHandler<TargetedCompositionEvent<Target>>
  export type DragEventHandler<Target extends EventTarget> = EventHandler<
    TargetedDragEvent<Target>
  >
  export type FocusEventHandler<Target extends EventTarget> = EventHandler<
    TargetedFocusEvent<Target>
  >
  export type GenericEventHandler<Target extends EventTarget> = EventHandler<
    TargetedEvent<Target>
  >
  export type KeyboardEventHandler<Target extends EventTarget> = EventHandler<
    TargetedKeyboardEvent<Target>
  >
  export type MouseEventHandler<Target extends EventTarget> = EventHandler<
    TargetedMouseEvent<Target>
  >
  export type PointerEventHandler<Target extends EventTarget> = EventHandler<
    TargetedPointerEvent<Target>
  >
  export type TouchEventHandler<Target extends EventTarget> = EventHandler<
    TargetedTouchEvent<Target>
  >
  export type TransitionEventHandler<Target extends EventTarget> = EventHandler<
    TargetedTransitionEvent<Target>
  >
  export type UIEventHandler<Target extends EventTarget> = EventHandler<
    TargetedUIEvent<Target>
  >
  export type WheelEventHandler<Target extends EventTarget> = EventHandler<
    TargetedWheelEvent<Target>
  >

  export interface DOMAttributes
    extends Partial<GlobalEventHandlers>,
      ActDOMAttributes {}

  export interface HTMLAttributes<RefType extends EventTarget = EventTarget>
    extends DOMAttributes {
    // Standard HTML Attributes
    accept?: string | ActLike<string>
    acceptCharset?: string | ActLike<string>
    accessKey?: string | ActLike<string>
    action?: string | ActLike<string>
    allow?: string | ActLike<string>
    allowFullScreen?: boolean | ActLike<boolean>
    allowTransparency?: boolean | ActLike<boolean>
    alt?: string | ActLike<string>
    as?: string | ActLike<string>
    async?: boolean | ActLike<boolean>
    autocomplete?: string | ActLike<string>
    autoComplete?: string | ActLike<string>
    autocorrect?: string | ActLike<string>
    autoCorrect?: string | ActLike<string>
    autofocus?: boolean | ActLike<boolean>
    autoFocus?: boolean | ActLike<boolean>
    autoPlay?: boolean | ActLike<boolean>
    capture?: boolean | string | ActLike<string>
    cellPadding?: number | string | ActLike<string>
    cellSpacing?: number | string | ActLike<string>
    charSet?: string | ActLike<string>
    challenge?: string | ActLike<string>
    checked?: boolean | ActLike<boolean>
    cite?: string | ActLike<string>
    class?: string | undefined | ActLike<string | undefined>
    className?: string | undefined | ActLike<string | undefined>
    cols?: number | ActLike<number>
    colSpan?: number | ActLike<number>
    content?: string | ActLike<string>
    contentEditable?: boolean | ActLike<boolean>
    contextMenu?: string | ActLike<string>
    controls?: boolean | ActLike<boolean>
    controlsList?: string | ActLike<string>
    coords?: string | ActLike<string>
    crossOrigin?: string | ActLike<string>
    data?: string | ActLike<string>
    dateTime?: string | ActLike<string>
    default?: boolean | ActLike<boolean>
    defaultChecked?: boolean | ActLike<boolean>
    defaultValue?: string | ActLike<string>
    defer?: boolean | ActLike<boolean>
    dir?: 'auto' | 'rtl' | 'ltr' | ActLike<'auto' | 'rtl' | 'ltr'>
    disabled?: boolean | ActLike<boolean>
    disableRemotePlayback?: boolean | ActLike<boolean>
    download?: any
    decoding?: 'sync' | 'async' | 'auto' | ActLike<'sync' | 'async' | 'auto'>
    draggable?: boolean | ActLike<boolean>
    encType?: string | ActLike<string>
    enterkeyhint?:
      | 'enter'
      | 'done'
      | 'go'
      | 'next'
      | 'previous'
      | 'search'
      | 'send'
      | ActLike<
          'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
        >
    form?: string | ActLike<string>
    formAction?: string | ActLike<string>
    formEncType?: string | ActLike<string>
    formMethod?: string | ActLike<string>
    formNoValidate?: boolean | ActLike<boolean>
    formTarget?: string | ActLike<string>
    frameBorder?: number | string | ActLike<number | string>
    headers?: string | ActLike<string>
    height?: number | string | ActLike<number | string>
    hidden?: boolean | ActLike<boolean>
    high?: number | ActLike<number>
    href?: string | ActLike<string>
    hrefLang?: string | ActLike<string>
    for?: string | ActLike<string>
    htmlFor?: string | ActLike<string>
    httpEquiv?: string | ActLike<string>
    icon?: string | ActLike<string>
    id?: string | ActLike<string>
    inputMode?: string | ActLike<string>
    integrity?: string | ActLike<string>
    is?: string | ActLike<string>
    keyParams?: string | ActLike<string>
    keyType?: string | ActLike<string>
    kind?: string | ActLike<string>
    label?: string | ActLike<string>
    lang?: string | ActLike<string>
    list?: string | ActLike<string>
    loading?: 'eager' | 'lazy' | ActLike<'eager' | 'lazy'>
    loop?: boolean | ActLike<boolean>
    low?: number | ActLike<number>
    manifest?: string | ActLike<string>
    marginHeight?: number | ActLike<number>
    marginWidth?: number | ActLike<number>
    max?: number | string | ActLike<string>
    maxLength?: number | ActLike<number>
    media?: string | ActLike<string>
    mediaGroup?: string | ActLike<string>
    method?: string | ActLike<string>
    min?: number | string | ActLike<string>
    minLength?: number | ActLike<number>
    multiple?: boolean | ActLike<boolean>
    muted?: boolean | ActLike<boolean>
    name?: string | ActLike<string>
    nomodule?: boolean | ActLike<boolean>
    nonce?: string | ActLike<string>
    noValidate?: boolean | ActLike<boolean>
    open?: boolean | ActLike<boolean>
    optimum?: number | ActLike<number>
    part?: string | ActLike<string>
    pattern?: string | ActLike<string>
    ping?: string | ActLike<string>
    placeholder?: string | ActLike<string>
    playsInline?: boolean | ActLike<boolean>
    poster?: string | ActLike<string>
    preload?: string | ActLike<string>
    radioGroup?: string | ActLike<string>
    readonly?: boolean | ActLike<boolean>
    readOnly?: boolean | ActLike<boolean>
    referrerpolicy?:
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url'
      | ActLike<
          | 'no-referrer'
          | 'no-referrer-when-downgrade'
          | 'origin'
          | 'origin-when-cross-origin'
          | 'same-origin'
          | 'strict-origin'
          | 'strict-origin-when-cross-origin'
          | 'unsafe-url'
        >
    rel?: string | ActLike<string>
    required?: boolean | ActLike<boolean>
    reversed?: boolean | ActLike<boolean>
    role?: string | ActLike<string>
    rows?: number | ActLike<number>
    rowSpan?: number | ActLike<number>
    sandbox?: string | ActLike<string>
    scope?: string | ActLike<string>
    scoped?: boolean | ActLike<boolean>
    scrolling?: string | ActLike<string>
    seamless?: boolean | ActLike<boolean>
    selected?: boolean | ActLike<boolean>
    shape?: string | ActLike<string>
    size?: number | ActLike<number>
    sizes?: string | ActLike<string>
    slot?: string | ActLike<string>
    span?: number | ActLike<number>
    spellcheck?: boolean | ActLike<boolean>
    spellCheck?: boolean | ActLike<boolean>
    src?: string | ActLike<string>
    srcset?: string | ActLike<string>
    srcDoc?: string | ActLike<string>
    srcLang?: string | ActLike<string>
    srcSet?: string | ActLike<string>
    start?: number | ActLike<number>
    step?: number | string | ActLike<number | string>
    style?: string | CSSProperties | ActLike<string | CSSProperties>
    summary?: string | ActLike<string>
    tabIndex?: number | ActLike<number>
    target?: string | ActLike<string>
    title?: string | ActLike<string>
    type?: string | ActLike<string>
    useMap?: string | ActLike<string>
    value?: string | string[] | number | ActLike<string | string[] | number>
    volume?: string | number | ActLike<string | number>
    width?: number | string | ActLike<number | string>
    wmode?: string | ActLike<string>
    wrap?: string | ActLike<string>

    // Non-standard Attributes
    autocapitalize?:
      | 'off'
      | 'none'
      | 'on'
      | 'sentences'
      | 'words'
      | 'characters'
      | ActLike<'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'>
    autoCapitalize?:
      | 'off'
      | 'none'
      | 'on'
      | 'sentences'
      | 'words'
      | 'characters'
      | ActLike<'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'>
    disablePictureInPicture?: boolean | ActLike<boolean>
    results?: number | ActLike<number>
    translate?: 'yes' | 'no' | ActLike<'yes' | 'no'>

    // RDFa Attributes
    about?: string | ActLike<string>
    datatype?: string | ActLike<string>
    inlist?: any
    prefix?: string | ActLike<string>
    property?: string | ActLike<string>
    resource?: string | ActLike<string>
    typeof?: string | ActLike<string>
    vocab?: string | ActLike<string>

    // Microdata Attributes
    itemProp?: string | ActLike<string>
    itemScope?: boolean | ActLike<boolean>
    itemType?: string | ActLike<string>
    itemID?: string | ActLike<string>
    itemRef?: string | ActLike<string>
  }

  export type DetailedHTMLProps<
    HA extends HTMLAttributes<RefType>,
    RefType extends EventTarget = EventTarget,
  > = HA

  export interface HTMLMarqueeElement extends HTMLElement {
    behavior?:
      | 'scroll'
      | 'slide'
      | 'alternate'
      | ActLike<'scroll' | 'slide' | 'alternate'>
    bgColor?: string | ActLike<string>
    direction?:
      | 'left'
      | 'right'
      | 'up'
      | 'down'
      | ActLike<'left' | 'right' | 'up' | 'down'>
    height?: number | string | ActLike<number | string>
    hspace?: number | string | ActLike<number | string>
    loop?: number | string | ActLike<number | string>
    scrollAmount?: number | string | ActLike<number | string>
    scrollDelay?: number | string | ActLike<number | string>
    trueSpeed?: boolean | ActLike<boolean>
    vspace?: number | string | ActLike<number | string>
    width?: number | string | ActLike<number | string>
  }

  export interface IntrinsicElements {
    // HTMLElementTagNameMap
    a: HTMLAttributes<HTMLAnchorElement>
    abbr: HTMLAttributes<HTMLElement>
    address: HTMLAttributes<HTMLElement>
    area: HTMLAttributes<HTMLAreaElement>
    article: HTMLAttributes<HTMLElement>
    aside: HTMLAttributes<HTMLElement>
    audio: HTMLAttributes<HTMLAudioElement>
    b: HTMLAttributes<HTMLElement>
    base: HTMLAttributes<HTMLBaseElement>
    bdi: HTMLAttributes<HTMLElement>
    bdo: HTMLAttributes<HTMLElement>
    big: HTMLAttributes<HTMLElement>
    blockquote: HTMLAttributes<HTMLQuoteElement>
    body: HTMLAttributes<HTMLBodyElement>
    br: HTMLAttributes<HTMLBRElement>
    button: HTMLAttributes<HTMLButtonElement>
    canvas: HTMLAttributes<HTMLCanvasElement>
    caption: HTMLAttributes<HTMLTableCaptionElement>
    cite: HTMLAttributes<HTMLElement>
    code: HTMLAttributes<HTMLElement>
    col: HTMLAttributes<HTMLTableColElement>
    colgroup: HTMLAttributes<HTMLTableColElement>
    data: HTMLAttributes<HTMLDataElement>
    datalist: HTMLAttributes<HTMLDataListElement>
    dd: HTMLAttributes<HTMLElement>
    del: HTMLAttributes<HTMLModElement>
    details: HTMLAttributes<HTMLDetailsElement>
    dfn: HTMLAttributes<HTMLElement>
    dialog: HTMLAttributes<HTMLDialogElement>
    div: HTMLAttributes<HTMLDivElement>
    dl: HTMLAttributes<HTMLDListElement>
    dt: HTMLAttributes<HTMLElement>
    em: HTMLAttributes<HTMLElement>
    embed: HTMLAttributes<HTMLEmbedElement>
    fieldset: HTMLAttributes<HTMLFieldSetElement>
    figcaption: HTMLAttributes<HTMLElement>
    figure: HTMLAttributes<HTMLElement>
    footer: HTMLAttributes<HTMLElement>
    form: HTMLAttributes<HTMLFormElement>
    h1: HTMLAttributes<HTMLHeadingElement>
    h2: HTMLAttributes<HTMLHeadingElement>
    h3: HTMLAttributes<HTMLHeadingElement>
    h4: HTMLAttributes<HTMLHeadingElement>
    h5: HTMLAttributes<HTMLHeadingElement>
    h6: HTMLAttributes<HTMLHeadingElement>
    head: HTMLAttributes<HTMLHeadElement>
    header: HTMLAttributes<HTMLElement>
    hgroup: HTMLAttributes<HTMLElement>
    hr: HTMLAttributes<HTMLHRElement>
    html: HTMLAttributes<HTMLHtmlElement>
    i: HTMLAttributes<HTMLElement>
    iframe: HTMLAttributes<HTMLIFrameElement>
    img: HTMLAttributes<HTMLImageElement>
    input: HTMLAttributes<HTMLInputElement>
    ins: HTMLAttributes<HTMLModElement>
    kbd: HTMLAttributes<HTMLElement>
    keygen: HTMLAttributes<HTMLUnknownElement>
    label: HTMLAttributes<HTMLLabelElement>
    legend: HTMLAttributes<HTMLLegendElement>
    li: HTMLAttributes<HTMLLIElement>
    link: HTMLAttributes<HTMLLinkElement>
    main: HTMLAttributes<HTMLElement>
    map: HTMLAttributes<HTMLMapElement>
    mark: HTMLAttributes<HTMLElement>
    marquee: HTMLAttributes<HTMLMarqueeElement>
    menu: HTMLAttributes<HTMLMenuElement>
    menuitem: HTMLAttributes<HTMLUnknownElement>
    meta: HTMLAttributes<HTMLMetaElement>
    meter: HTMLAttributes<HTMLMeterElement>
    nav: HTMLAttributes<HTMLElement>
    noscript: HTMLAttributes<HTMLElement>
    object: HTMLAttributes<HTMLObjectElement>
    ol: HTMLAttributes<HTMLOListElement>
    optgroup: HTMLAttributes<HTMLOptGroupElement>
    option: HTMLAttributes<HTMLOptionElement>
    output: HTMLAttributes<HTMLOutputElement>
    p: HTMLAttributes<HTMLParagraphElement>
    param: HTMLAttributes<HTMLParamElement>
    picture: HTMLAttributes<HTMLPictureElement>
    pre: HTMLAttributes<HTMLPreElement>
    progress: HTMLAttributes<HTMLProgressElement>
    q: HTMLAttributes<HTMLQuoteElement>
    rp: HTMLAttributes<HTMLElement>
    rt: HTMLAttributes<HTMLElement>
    ruby: HTMLAttributes<HTMLElement>
    s: HTMLAttributes<HTMLElement>
    samp: HTMLAttributes<HTMLElement>
    script: HTMLAttributes<HTMLScriptElement>
    section: HTMLAttributes<HTMLElement>
    select: HTMLAttributes<HTMLSelectElement>
    slot: HTMLAttributes<HTMLSlotElement>
    small: HTMLAttributes<HTMLElement>
    source: HTMLAttributes<HTMLSourceElement>
    span: HTMLAttributes<HTMLSpanElement>
    strong: HTMLAttributes<HTMLElement>
    style: HTMLAttributes<HTMLStyleElement>
    sub: HTMLAttributes<HTMLElement>
    summary: HTMLAttributes<HTMLElement>
    sup: HTMLAttributes<HTMLElement>
    table: HTMLAttributes<HTMLTableElement>
    tbody: HTMLAttributes<HTMLTableSectionElement>
    td: HTMLAttributes<HTMLTableCellElement>
    textarea: HTMLAttributes<HTMLTextAreaElement>
    tfoot: HTMLAttributes<HTMLTableSectionElement>
    th: HTMLAttributes<HTMLTableCellElement>
    thead: HTMLAttributes<HTMLTableSectionElement>
    time: HTMLAttributes<HTMLTimeElement>
    title: HTMLAttributes<HTMLTitleElement>
    tr: HTMLAttributes<HTMLTableRowElement>
    track: HTMLAttributes<HTMLTrackElement>
    u: HTMLAttributes<HTMLElement>
    ul: HTMLAttributes<HTMLUListElement>
    var: HTMLAttributes<HTMLElement>
    video: HTMLAttributes<HTMLVideoElement>
    wbr: HTMLAttributes<HTMLElement>
  }
}

export import JSX = JSXInternal

export type Key = string | number | any

interface Subscribable<T = any> {
  subscribe(cb: (state: T) => any): () => void
}

export type ComponentChild =
  | Subscribable
  | object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
export type ComponentChildren = ComponentChild[] | ComponentChild

export interface ActDOMAttributes {
  children?: ComponentChildren
}

export type RenderableProps<P> = P & Readonly<{ children?: ComponentChildren }>

export type ComponentType<P = {}> = FunctionComponent<P>
export type ComponentFactory<P = {}> = ComponentType<P>

export type ComponentProps<
  C extends ComponentType<any> | keyof JSXInternal.IntrinsicElements,
> = C extends ComponentType<infer P>
  ? P
  : C extends keyof JSXInternal.IntrinsicElements
  ? JSXInternal.IntrinsicElements[C]
  : never

export interface FunctionComponent<P = {}> {
  (props: RenderableProps<P>, context?: any): HTMLElement | null
}
export interface FunctionalComponent<P = {}> extends FunctionComponent<P> {}

export type AnyComponent<P = {}, S = {}> = FunctionComponent<P>

// @ts-expect-error
export function h(
  type: 'input',
  props: JSX.DOMAttributes | null,
  ...children: ComponentChildren[]
): HTMLElement
// @ts-expect-error
export function h<P extends JSX.HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof JSX.IntrinsicElements,
  props: P | null,
  ...children: ComponentChildren[]
): HTMLElement
// @ts-expect-error
export function h<T extends HTMLElement>(
  type: string,
  props: JSX.HTMLAttributes | null,
  ...children: ComponentChildren[]
): HTMLElement
// @ts-expect-error
export function h<P>(
  type: ComponentType<P>,
  props: P | null,
  ...children: ComponentChildren[]
): HTMLElement

// @ts-expect-error
export namespace h {
  export import JSX = JSXInternal
}

// @ts-expect-error
export var h = (tag: any, props: Record<string, any>, ...children: any[]) => {
  if (tag === hf) return children

  if (typeof tag === 'function') return tag(props ?? {}, children)

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
