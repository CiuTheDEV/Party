# Module Maturity Model

Internal maturity guide for game modules in Project Party.

Use this document to avoid treating `live` as a vague catch-all label.

This is a working quality model, not a public product label.

---

## Why This Exists

`config.status` still needs to stay simple:
- `coming-soon`
- `live`

But inside the repo, that is not enough to describe maturity.

This file gives a more precise internal checklist for:
- current modules,
- new game modules,
- readiness conversations.

It does **not** replace `config.status`.
It gives the team a more precise internal language for what `live` or `coming-soon` actually means in practice.

---

## Maturity Levels

### Level 1 — Scaffolded

The module has:
- package scaffold,
- config,
- menu shell or placeholder,
- basic route integration.

Typical product status:
- `coming-soon`

### Level 2 — Setup Complete

The module has:
- working setup state,
- working validation,
- setup sections,
- menu/setup integration,
- theme applied correctly.

Typical product status:
- still `coming-soon` unless runtime is real

### Level 3 — Runtime Implemented

The module has:
- game runtime screens,
- game-specific runtime logic,
- basic entry into runtime,
- non-placeholder blocking flows where needed.

This is not enough by itself for confidence.

### Level 4 — Browser Verified

The module has:
- build/check coverage relevant to the module,
- at least one honest browser flow through critical surfaces,
- validated modals/alerts/critical transitions,
- layout sanity on the target surfaces that matter for the game.

This is the minimum maturity expected before calling a runtime confidently usable.

### Level 5 — Production Verified

The module has:
- production or production-like runtime verified,
- deploy/runtime path checked,
- real networking/role/device paths validated if applicable.

Use this level when deploy or live runtime behavior matters.

---

## Practical Use

When discussing a module internally, prefer language like:

- `Charades is live, runtime implemented, but still needs browser re-verification on presenter reveal.`
- `Codenames is live and browser-verified for host controls, but pool-manager polish remains blocked on setup-flow verification.`

This is better than flattening everything into just `live`.

---

## Review Questions

Before treating a module as mature enough for broader work:

- Is setup complete and truthful?
- Is runtime real, not placeholder?
- Is there at least one browser-verified critical flow?
- Are destructive/blocking flows validated?
- Is the module still game-owned rather than hub-owned?

---

## Anti-Pattern

Avoid saying:
- `it is live, so it is done`

Instead ask:
- live at what maturity?
- verified where?
- missing what?
