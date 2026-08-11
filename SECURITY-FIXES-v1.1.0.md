# Security fixes — ORDnet web3names v1.1.0

**Released:** 11 August 2026
**Supersedes:** v1.0.0

## H3 — A verified answer was not bound to the question that was asked

**Was:**

```js
export function verifyAnswer (a, crypto, { resolverPubKey, nowSeconds } = {}) {
  if (a.expires <= now) return { valid: false, reason: 'expired' }
  if (a.signer && a.signer !== resolverPubKey) return { valid: false, reason: 'unknown_signer' }
  const ok = crypto.ecdsaVerifyDer(sighashOf(a, crypto), a.sig, resolverPubKey)
  return ok ? { valid: true } : { valid: false, reason: 'bad_signature' }
}
```

Every check here is correct, and together they are not verification.

The signed preimage covers the answer's **own** `name` field. So an answer for
`attacker.web3` — genuinely issued, correctly signed by the real resolver key,
not expired, everything in order — returns `{ valid: true }` when the caller
asked for `victim.web3`. The function was never told what was asked, so it
could not notice.

That turns anything sitting between the caller and the resolver into a
substitution point: a cache, a proxy, a relay, a wallet's own answer store.
None of them needs a key. They only need to hand back a different valid answer
than the one requested.

The answer's `ok` field was not checked either, so an `ok: false` body — which
still carries a name and can still be signed — verified like any other, and a
caller reading its fields anyway would treat an error as an answer.

**Now,** the checks run in this order, before the signature is even consulted:

1. the body is an object and says `ok: true`
2. `expectName` is present and parses as an address
3. the answer's `name` equals the normalised requested name
4. the mailbox matches — or the answer honestly declares itself a domain-holder
   fallback (ODNCA-STD-001 §5)
5. expiry, then signer pinning, then the signature

`expectName` is **required**. Not optional-with-a-warning: a verification
function that does not know the question cannot produce a meaningful verdict,
so it fails closed with `no_expected_name` rather than returning a `valid: true`
it cannot justify.

The name comparison goes through the STD-001 normalisation, so
`sns:Alexander@ORDNET.web3` and `alexander@ordnet.web3` are the same question.

## Breaking change

Callers must pass `expectName`:

```js
// before
verifyAnswer(answer, crypto, { resolverPubKey: key })

// after
verifyAnswer(answer, crypto, { resolverPubKey: key, expectName: 'alex@earthlog.web3' })
```

Pass the address exactly as the user gave it — the function normalises it. A
call that omits it now returns `{ valid: false, reason: 'no_expected_name' }`,
which is loud and obvious rather than quietly permissive.

New verdict reasons: `not_ok`, `malformed`, `no_expected_name`,
`name_mismatch`, `mailbox_mismatch`.

## Tests

```bash
npm test
```

**33 tests**, up from 22.

The new cases are the ones that used to pass and should not have:

- a signed answer for another name is rejected as `name_mismatch` — and the
  test asserts the reason is **not** `bad_signature`, because the signature is
  perfectly valid; that is the whole point
- verification with no stated question fails closed
- an unparseable question fails closed
- case and an `sns:` scheme on the question do not break the match
- `ok: false`, a missing `ok`, and `null` are all refused, the last without
  throwing
- a mailbox question answered by the domain holder is allowed **only** when
  `fallback: true` is declared; a different mailbox without it is rejected, and
  a mailbox answer to a bare-domain question is rejected

## Not changed

The signature scheme itself, the field order, the domain tag and the frozen
conformance vector are untouched. `signedPreimage()` and `sighashOf()` produce
byte-identical output to v1.0.0.


## The same fix belongs in PR #114

This module is the one proposed to `bsv-blockchain/bsv-browser` as
[PR #114](https://github.com/bsv-blockchain/bsv-browser/pull/114). The copy in
that branch carries the same hole, and `openWeb3Site.ts` there calls
`verifyAnswer` without `expectName`. Both are patched in the accompanying
overlay so the PR does not merge the issue into the browser.
