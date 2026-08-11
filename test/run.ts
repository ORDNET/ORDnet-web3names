// Minimal zero-dependency test harness (describe / it / expect subset).
// Run with:  npx tsx test/run.ts
import { deepStrictEqual } from 'node:assert'

let passed = 0
const failed: string[] = []
const stack: string[] = []
const queue: Array<() => Promise<void> | void> = []

;(globalThis as any).describe = (name: string, fn: () => void) => {
  stack.push(name); fn(); stack.pop()
}
;(globalThis as any).it = (name: string, fn: () => Promise<void> | void) => {
  const label = [...stack, name].join(' › ')
  queue.push(async () => {
    try { await fn(); passed++; console.log(`  ok  ${label}`) }
    catch (e: any) { failed.push(label); console.log(`FAIL  ${label}\n      ${e?.message ?? e}`) }
  })
}
function matchers (actual: unknown, negate = false) {
  const ok = (pass: boolean, msg: string) => {
    if (pass === negate) throw new Error(negate ? `not: ${msg}` : msg)
  }
  return {
    toBe: (exp: unknown) =>
      ok(Object.is(actual, exp), `expected ${JSON.stringify(exp)}, got ${JSON.stringify(actual)}`),
    toEqual: (exp: unknown) => {
      let pass = true
      try { deepStrictEqual(actual, exp) } catch { pass = false }
      ok(pass, `expected deep equality with ${JSON.stringify(exp)}`)
    },
    toBeNull: () => ok(actual === null, `expected null, got ${JSON.stringify(actual)}`),
    get not () { return matchers(actual, !negate) },
  }
}
;(globalThis as any).expect = (actual: unknown) => matchers(actual)

await import('./web3names.test.ts')
for (const run of queue) await run()
console.log(`\nRESULT: ${passed} passed, ${failed.length} failed`)
if (failed.length) process.exit(1)
