# Security Policy

## Reporting a vulnerability

Please report security issues privately first. Do not open a public issue for
anything that could put funds or names at risk.

**Preferred channel:** [GitHub private vulnerability reporting](https://github.com/ORDNET/ORDnet-web3names/security/advisories/new)
— the "Report a vulnerability" button on the Security tab of this repository.
This creates a private advisory only the maintainers can see.

Please include what the issue is, which file and line, how to reproduce it,
and what an attacker gains.

## What to expect

- **Acknowledgement:** within 3 working days.
- **Assessment:** within 10 working days, with a severity.
- **Credit:** we will name you in the release notes unless you prefer otherwise.

We do not currently operate a bug bounty.

## Threat model

This module turns a typed name into a destination a browser or wallet will act
on. What matters:

1. **A verdict must be about the question that was asked.** Without binding the
   answer to the request, every cache, proxy or relay in the path becomes a
   substitution point.
2. **Content is untrusted.** On-chain bodies are written by anyone; they are
   txid-anchored and size-capped before they are rendered, and never given a
   privileged origin.
3. **The TLD set is guarded.** A hostile `/health` must not be able to teach
   the classifier that a web2 TLD is a web3 name.

Out of scope: the host application's rendering surface and its key management.

## Known history

Version 1.0.0's `verifyAnswer()` did not bind the answer to the requested name
and did not check the answer's `ok` field. Fixed in **1.1.0** — `expectName` is
now a required option. The same fix applies to the copy of this module in
[bsv-blockchain/bsv-browser PR #114](https://github.com/bsv-blockchain/bsv-browser/pull/114).
See [SECURITY-FIXES-v1.1.0.md](SECURITY-FIXES-v1.1.0.md).
