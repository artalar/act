**Act** is the most efficient reactive library in both: speed, size, correctness. [Here is](https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn) the really complex benchmark which Act passed pefectly. The size is only [0.3KB gzip](https://bundlejs.com/?q=%40artalar%2Fact)!

I builded it for fun, but you could use it and report bugs or suggestions, I'm open.

> Read [why it so small and so fast?](#why-it-is-so-small-and-so-fast)

## Installation

```sh
npm i @artalar/act
```

## Usage

> See [React example below](#react-example).

### Basic example

[![Edit @artalar/act](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/artalar-act-9wz836?file=/src/index.ts)

```ts
import { act, batch } from '@artalar/act'

// create mutable reactive value reference
const counterAct = act(0)
// create computed reactive value reference, use other acts here in any conditions
const isOddAct = act(() => Boolean(counterAct() % 2))

// kind a actions
const set = (n: number) => counterAct(n)
const add = (n: number) => counterAct(counterAct() + n)
const inc = () => add(1)

// subscribe
const un = isOddAct.subscribe((v) => console.log('isOdd', v))
// 'isOdd false'

set(0)
// nothing

inc()
// 'isOdd true'
add(2)
// nothing
inc()
// 'isOdd false'

batch(() => {
  inc()
  inc()
})
// nothing

batch(() => {
  inc()
  inc()
  inc()
})
// 'isOdd true'

// unsubscribe
un()
inc()
// nothing
```

### Filter example

Computed act accepts equality check function by second argument and allows you to filter updates with `shallowEqual` etc.

```ts
const filterAct = act('')
const listAct = act([])
const listFilterredAct = act(
  () => {
    const filter = filterAct()
    return listAct().filter((text) => text.includes(filter))
  },
  (prev, next) => isShallowEqual(prev, next),
)
```

### Conditional branches example

The most proud thing of Act is conditional branches optimization. It does not matter how complex your conditions and other Acts usage in them, this will be optimized in the most efficient way with minimal cost.

```ts
const isAdminAct = act(false)
const listAct = act([])
const filterAct = act('')
const listAct = act([])
const listFilterredAct = act(
  () => listAct().filterAct((text) => text.includes(filterAct())),
  isShallowEqual,
)
export const listViewAct = act(() =>
  isAdminAct() ? listFilterredAct() : listAct(),
)
```

### Dynamic acts example

As in the example below you could use (subscribe to) acts inside loops and create (and delete) acts dynamically. It could be useful to optimize your data updates and subscribtions.

> See [dinamic list in React](#react-example-dinamic-list).

```ts
const listAct = act([])
const sumAct = act(() =>
  listAct().reduce((acc, counterAct) => acc + counterAct(), 0),
)
const add = () => listAct([...listAct(), act(0)])
```

### React example

The magic is... You didn't need an adapter to use Act in React! The built-in "useSyncExternalStore" is the only thing you need ([docs](https://beta.reactjs.org/reference/react/useSyncExternalStore)).

[![Edit @artalar/act react](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/artalar-act-react-vyqch1?fontsize=14&hidenavigation=1&theme=dark)

```ts
const counterAct = act(0)
const inc = () => counterAct(counterAct() + 1)

export default function App() {
  const counter = useSyncExternalStore(counterAct.subscribe, counterAct)

  return <button onClick={inc}>{counter}</button>
}
```

### React example dinamic list

This example shows how you could share state bitween components for in a couple lines of code and optimize rerenders.

[![Edit @artalar/act react](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/artalar-act-react-list-vesmct?file=/src/App.tsx)

## The rule

Only one rule that you should care. Аn act reading returns a guaranteed fresh state only if you have subscribtion to it (or to it dependent act). It is assumed that you will only work with reactive data. However, if you need to get actual value of unobserved act just subscribe to it and immediately unsubscribe.

```ts
anAct.subscribe(() => {})(); // actualize
const value = anAct();
```

Also, it would be clearer for you to shedule any mutations outside the subscribtion call tick, like `anAct.subscribe((newValue) => Promise.resolve(() => batch(() => ...)))`

## Why it is so small and so fast?

I researching reactive programming and working on a different prototypes a half of decade already. The most production ready and feature rich result of it is [reatom.dev](https://www.reatom.dev/). Under the hood Reatom uses topological sorting on top of immutable graph features, to achieve things like DI and lifecycle hooks. But does it need for all users? Nope. So I decided to create a lightweight version of Reatom with simpliest api and most lower cost and size.

Sooo, how it work? One of the difficult thing in reactive programming is optimization of node combination and it [glitches](https://en.wikipedia.org/wiki/Reactive_programming#Glitches). But the condition usage of computed dependencies is the most hard and painful thing, there is a lot of corner cases which you should care, if you want to support any kind of conditions in most optimal way.

Like, you should unsubscribe from all unused dependencies, but how to know which is used and which is not? Basically, there is some hook which work under the hood and links the parent and the child of computations. And when you use the same dependencies each time in your computations the hook understand it and don't resubscribe to them. But what if you use the same dependencie a few times? Or what if you stop using some dependencie in the start of your computations, but still uses other dependencies below, how to understand that the below dependencies were used before or are they new?

All this cases proccesed by complex cache invalidation policy which took a significant cost in terms of performance and memory usage.

But... We already use a lot of memory for caches and CPU for it ivalidation? So, may be that overhead is not worth it and the whole recalculation of all dependencie graph could be cheaper? Is it? Well, this library answer, **YES**.

Act not uses two-directional links in dependencies graph and don't need to invalidate it. The only connections which builded from the scratch on each update is "subscriber <- (any count of computed nodes without knowing of together) <- value setter (`ActValue` type)". This is super cheap.

But there is one [limitation](#the-rule), as we don't have a cross-links and statuses of invalidation, we couldn't read act without subscibtions safety. And there is a hidden performance issue too. As each subscriber need to give a know about itself to dependencies setters, every subscriber should walk the whole graph each time and if you have one complex act with many subscribers it would be not absolutely optimal. The good news are: 1) this is a rare case; 2) the whole graph traverse is probably cheap operation, thanks to JIT.

However, [Reatom](https://www.reatom.dev/) combines both approaches and optimize all your computations in most complex cases, allows you to inspect immutable snaphots of all updates. If you need something more feature rich, take a look into it.
