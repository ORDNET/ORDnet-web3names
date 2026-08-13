# Security fixes — ORDnet web3names v1.2.0

**Audit:** external GitHub review of 13 August 2026
**Supersedes:** v1.1.0

## The expiry check did nothing

Identical to the finding in `ORDnet-SNS-client` — the file arrived here by
copy-paste, and so did the bug. `a.expires <= now` is `false` for a missing,
`NaN`, string or object value, so those answers never expired. Fixed with
`Number.isFinite`.

## The TLD gate was a denylist, and it hijacked real gTLDs

`WEB2_TLD_BLOCKLIST` held 32 entries against roughly 1500 delegated gTLDs.
Demonstrated with a hostile `/health`:

```
mijnbank.bank -> web3      <-- a strictly regulated ICANN gTLD, intercepted
winkel.shop   -> web3
login.online  -> web3
mail.email    -> web3
iets.be       -> web3
```

A malicious resolver — precisely the actor this file's own comments say it
distrusts — could take over the address bar for real web2 domains, and the
pollution survived a refresh.

**Now it is an allowlist.** A refresh can only *confirm* TLDs already in the
build-time snapshot; it can mark them retired and it can remove nothing. A
genuinely new TLD requires a release of this module. That is the honest
trade-off until the ODNCA root registry is a signed document a client can
verify for itself.

## The package was not installable

`"main": "src/index.ts"` with no build step, no `types`, and `@bsv/sdk`
imported by `src/adapters.ts` while appearing in neither `dependencies` nor
`peerDependencies`.

Now: `tsconfig.json`, `main`/`types`/`exports` pointing at `dist/`, a `build`
script wired to `prepublishOnly`, `@bsv/sdk` declared as an optional peer, and
`files` limited to what belongs in a published package.

## Tests

45, up from 33. The new TLD cases target the regulated and popular gTLDs a
32-entry denylist would have missed, and assert that a resolver can neither
invent a TLD nor remove a shipped one.

