**Act** is the most efficient reactive library in both: speed, size, correctness. [Here is](https://perf.js.hyoo.ru/#!bench=s7inxj_eie42w) the really complex benchmark which Act passed pefectly. The size is only [0.3KB gzip](https://bundlejs.com/?q=%40artalar%2Fact).

I builded it for fun, but you could use it and report bugs or suggestions, I'm open.

## Installation

```sh
npm i @artalar/act
```

## Usage

[![Edit @artalar/act](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/loving-sunset-9wz836?fontsize=14&hidenavigation=1&theme=dark)

```ts
import { act, batch } from "@artalar/act";

// create mutable reactive value reference
const counter = act(0);
// create computed reactive value reference, use other acts here in any conditions
const isOdd = act(() => Boolean(counter() % 2));

// kind a actions
const set = (n) => counter(n);
const add = (n) => counter(counter() + n);
const inc = () => add(1);

// subscribe
cinst un = isOdd.subscribe(v => console.log("isOdd", v))
// 'isOdd false'

set(0);
// nothing

inc();
// 'isOdd true'
add(2);
// nothing
inc();
// 'isOdd false'

batch(() => {
  inc();
  inc();
});
// nothing

batch(() => {
  inc();
  inc();
  inc();
});
// 'isOdd true'

un()
inc();
// nothing
```

Computed act accepts equality check function by second argument and allows you to filter updates with `shallowEqual` etc.

```ts
const filter = act('')
const list = act([])
const listFilterred = act(
  () => {
    const query = filter()
    return list().filter(text => text.includes(query))
  },
  (prev, next) => isShallowEqual(prev, next)
)
```

Here is another form example:

[![Edit @artalar/act form](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/artalar-act-forked-i0p9pe?fontsize=14&hidenavigation=1&theme=dark)