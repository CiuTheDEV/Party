# Behavior Rules Extended (On-demand loading)

> Low-frequency rules split from `rules/behaviors.md`. Load when needed.

## Knowledge Base Write Strategy

**Pre-write decision tree**:
```text
Received content to record ->
|-- Clear precedent? (same directory has similar files)
|   +-- File directly + update knowledge index
|-- Know the domain but no precedent?
|   +-- Write to Inbox, annotate suggested location
+-- Not sure about classification?
    +-- Write to Inbox
```

**Banned**:
- Writing the same content to multiple files (SSOT violation)
- Inventing new directories without precedent
- Skipping the decision tree

## Proactive Association Rules

### Starting a new task
Check `memory/patterns.md` first:
- any related pitfall records?
- any related decision patterns?

### Completing a code task
Self-check:
- any pitfall experience to record?
- does `PROJECT_CONTEXT.md` need an update?

### User expresses emotion (tired / frustrated / anxious)
- Check recent work intensity in `memory/today.md`
- Do not take frustration literally - address the underlying issue

## Execution Plan Mode (complex tasks)

```text
User requirement -> Codex outputs execution plan -> User approves -> Codex executes -> Report
```

**Execution plan template**:
```text
## Execution Plan
Task: [one sentence]
Scope: [files/modules affected]
Verification: [lint/build/test commands]
Risk: [potential issues]
```

---

*Split from `behaviors.md` for on-demand loading.*
