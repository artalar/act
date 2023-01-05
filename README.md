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
let isActual = true;
const effect = act(() => isActual && console.log("isOdd", isOdd()));
// nothing

effect();
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

// unsubscribe
isActual = false
inc();
// nothing
```
