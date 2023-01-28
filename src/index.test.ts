import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { signal, computed, notify } from './index'

test('read outside effect stale computed', () => {
  const a = signal(0)
  const b = computed(() => a.value)

  assert.is(b.value, 0)

  a.value++
  assert.is(b.value, 1)
})

test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn', () => {
  let res: Array<number> = []

  const numbers = Array.from({ length: 2 }, (_, i) => i)

  const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2))

  const hard = (n: number, l: string) => n + fib(16)

  const A = signal(0)
  const B = signal(0)
  const C = computed(() => (A.value % 2) + (B.value % 2))
  const D = computed(
    () => numbers.map((i) => i + (A.value % 2) - (B.value % 2)),
    (l, r) => l.length === r.length && l.every((v, i) => v === r[i]),
  )
  const E = computed(() => hard(C.value + A.value + D.value[0]!, 'E'))
  const F = computed(() => hard(D.value[0]! && B.value, 'F'))
  const G = computed(
    () => C.value + (C.value || E.value % 2) + D.value[0]! + F.value,
  )
  let H = G.subscribe((v) => res.push(hard(v, 'H')))
  let I = G.subscribe((v) => res.push(v))
  let J = F.subscribe((v) => res.push(hard(v, 'J')))

  let i = 2
  while (--i) {
    res.length = 0
    B.value = 1
    A.value = 1 + i * 2
    notify()

    A.value = 2 + i * 2
    B.value = 2
    notify()

    assert.is(res.length, 4)
    assert.equal(res, [3198, 1601, 3195, 1598])
  }
})

test('throw should not broke linking', () => {
  try {
    // @ts-expect-error
    act(() => ({}.a.b)).subscribe(() => {})
  } catch {}

  const A = signal(0)
  const B = computed(() => A.value)
  const C = computed(() => A.value)
  C.subscribe((c) => {})

  A.value++
  assert.equal([A.value, B.value, C.value], [1, 1, 1])
})

test('should not store duplicate effects', () => {
  const a = signal(0)
  computed(() => {
    for (let i = 0; i < 10; i++) a.value
  }).subscribe(() => {})

  assert.is(a.__subscribers.size, 1)
})

test('should not stale subscribtion', () => {
  const a = signal(0)
  const b = signal(0)
  computed(() => b.value || a.value).subscribe(() => {})

  assert.is(a.__subscribers.size, 1)
  b.value = 123
  notify()
  assert.is(a.__subscribers.size, 0)
})

test('redefine act.notify', async () => {
  // delay this test to make other sync test cleaner
  await new Promise((r) => setTimeout(r, 10))

  notify.schedule = () => setTimeout(notify, 1)

  const a = signal(0)
  let calls = 0
  a.subscribe(() => calls++)

  assert.is(calls, 1)

  a.value = 123
  await 0
  assert.is(calls, 1)
  await new Promise((r) => setTimeout(r, 1))
  assert.is(calls, 2)
})

test.run()
