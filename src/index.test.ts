import { act, batch } from './index'

let res: Array<number> = []

const numbers = Array.from({ length: 2 }, (_, i) => i)

const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2))

const hard = (n: number, l: string) => n + fib(16)

// ---

const A = act(0)
const B = act(0)
const C = act(() => (A() % 2) + (B() % 2))
const D = act(
  () => numbers.map((i) => i + (A() % 2) - (B() % 2)),
  (l, r) => l.length === r.length || l.every((v, i) => v === r[i]),
)
const E = act(() => hard(C() + A() + D()[0]!, 'E'))
const F = act(() => hard(D()[0]! && B(), 'F'))
const G = act(() => {
  const state = C() + (C() || E() % 2) + D()[0]! + F()
  console.log('G', state)
  return state
})
const H = act(() => res.push(hard(G(), 'H')))
const I = act(() => res.push(G()))
const J = act(() => res.push(hard(F(), 'J')))
H.subscribe(() => {})
I.subscribe(() => {})
J.subscribe(() => {})

let i = 3
while (--i) {
  res.length = 0
  console.log('batch', i)
  batch(() => {
    B(1)
    A(1 + i * 2)
  }) // H
  console.log('batch', i)
  batch(() => {
    A(2 + i * 2)
    B(2)
  }) // EH
  console.log(res)
}
