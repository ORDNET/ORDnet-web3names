# Changelog — ORDnet web3names

All notable changes to the web3-name resolution module.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.1.0] — 2026-08-11 — security release (breaking)

### Security

- **A verified answer was not bound to the requested name.** Same finding as
  ORDnet-SNS-client 1.1.0, in this module's `verifyAnswer()`, and
  `openWeb3Site.ts` called it without passing what it had asked for.
  See [SECURITY-FIXES-v1.1.0.md](SECURITY-FIXES-v1.1.0.md).

### Changed

- **BREAKING:** `expectName` is now a required option on `VerifyOptions`.
- New verdict reasons: `not_ok`, `malformed`, `no_expected_name`,
  `name_mismatch`, `mailbox_mismatch`.

### Added

- 11 regression tests (22 → 33) and `SECURITY.md`.

### Note

The copy of this module in
[bsv-blockchain/bsv-browser PR #114](https://github.com/bsv-blockchain/bsv-browser/pull/114)
carries the same fix, so the issue is not merged into the browser.

---

## [1.0.0] — 2026-08 — initial public release

Zero-dependency web3-name module: STD-001 parsing, TLD gating, signed
resolution, merkle-proof folding, txid-anchored on-chain content and a
conservative address-bar classifier.
