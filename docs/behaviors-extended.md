# Behavior Rules Extended (On-demand loading)

> Low-frequency rules split from rules/behaviors.md. Load when needed.

## Knowledge Base Write Strategy

**Pre-write decision tree**:
```
Received content to record →
|-- Clear precedent? (same directory has similar files)
|   +-- File directly + update knowledge index
|-- Know the domain but no precedent?
|   +-- Write to Inbox, annotate suggested location
+-- Not sure about classification?
    +-- Write to Inbox
```

**Banned**:
- Same content written to multiple files (SSOT violation)
- Inventing new directories without precedent
- Skipping decision tree

## Proactive Association Rules

### Starting new task
Check `memory/patterns.md` first:
- Any related pitfall records?
- Any related decision patterns?

### Completing code task
Self-check:
- Any pitfall experience to record?
- Need to update PROJECT_CONTEXT.md?

### User expresses emotion (tired/frustrated/anxious)
- Check recent work intensity (`memory/today.md`)
- Don't take frustration literally — address the underlying issue

## Execution Plan Mode (complex tasks)

```
User requirement → Claude outputs execution plan → User approves → Claude executes → Report
```

**Execution plan template**:
```
## Execution Plan
Task: [one sentence]
Scope: [files/modules affected]
Verification: [lint/build/test commands]
Risk: [potential issues]
```

---

*Split from behaviors.md for on-demand loading*
