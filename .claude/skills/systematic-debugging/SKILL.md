---
name: systematic-debugging
description: Systematic debugging - find root cause before fixing, memory recall first
---

# Systematic Debugging

**Core principle**: ALWAYS find root cause before attempting fixes.

```
NO FIXES WITHOUT ROOT CAUSE FIRST
NO ROOT CAUSE WITHOUT MEMORY RECALL FIRST
```

## Five Phases

### Phase 0: Memory Recall (mandatory first step)
1. Extract keywords from error
2. Query memory for related past experiences
3. Found match → apply directly. Nothing → proceed to Phase 1.

### Phase 1: Root Cause Investigation
1. Read error messages completely — don't skip warnings
2. Reproduce consistently
3. Check recent changes: `git log --oneline -10` / `git diff HEAD~5`
4. Trace data flow to source

### Phase 2: Pattern Analysis
1. Find working similar code in codebase
2. Compare working vs broken — list every difference

### Phase 3: Hypothesis Testing
1. Form single hypothesis: "I think X is the root cause because Y"
2. Minimal change to test — one variable at a time

### Phase 4: Implementation
1. Write failing test first
2. Implement single fix
3. Verify fix — test passes, no regression
4. If 3+ fixes failed → STOP, question architecture

## Red Flags — STOP

- "Quick fix for now"
- Proposing solutions before tracing data flow
- "One more attempt" after 2 failures

**All of these mean: STOP. Return to Phase 1.**
