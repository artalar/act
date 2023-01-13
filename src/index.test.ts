import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { act } from './index'

const sync = (cb: () => any) => {
  let { notify } = act
  let run: () => any
  act.notify = (_run) => (run = _run)
  try {
    cb()
  } finally {
    act.notify = notify
  }
  run!()
}

test('read outside effect stale computed', () => {
  const a = act(0)
  const b = () => a()

  assert.is(b(), 0)

  a(1)
  assert.is(b(), 1)
})

test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn', () => {
  let res: Array<number> = []

  const numbers = Array.from({ length: 2 }, (_, i) => i)

  const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2))

  const hard = (n: number, l: string) => n + fib(16)

  const A = act(0)
  const B = act(0)
  const C = act(() => (A() % 2) + (B() % 2))
  const D = act(
    () => numbers.map((i) => i + (A() % 2) - (B() % 2)),
    (l, r) => l.length === r.length && l.every((v, i) => v === r[i]),
  )
  const E = act(() => hard(C() + A() + D()[0]!, 'E'))
  const F = act(() => hard(D()[0]! && B(), 'F'))
  const G = act(() => C() + (C() || E() % 2) + D()[0]! + F())
  let H = G.subscribe((v) => res.push(hard(v, 'H')))
  let I = G.subscribe((v) => res.push(v))
  let J = F.subscribe((v) => res.push(hard(v, 'J')))

  let i = 4
  while (--i) {
    res.length = 0
    sync(() => {
      B(1)
      A(1 + i * 2)
    })

    sync(() => {
      A(2 + i * 2)
      B(2)
    })

    assert.equal(res, [3198, 1601, 3195, 1598])
  }
})

test('should not store duplicate effects', () => {
  const a = act(0)
  act(() => {
    for (let i = 0; i < 10; i++) a()
  }).subscribe(() => {})

  assert.is(a._e.length, 1)
})

test.run()
