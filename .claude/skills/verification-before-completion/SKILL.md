---
name: verification-before-completion
description: Must run verification commands before claiming done. Evidence before claims.
---

# Verification Before Completion

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

## The Gate

```
BEFORE claiming done:
1. IDENTIFY: what command proves this claim?
2. RUN: execute the full command
3. READ: full output, check exit code
4. VERIFY: does output confirm the claim?
5. ONLY THEN: make the claim
```

## Common Failures

| Claim | Requires | Not sufficient |
|-------|----------|----------------|
| Tests pass | 0 failures in output | "Should pass" |
| Build succeeds | exit 0 | Linter passing |
| Bug fixed | Original symptom gone | Code changed |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- About to commit without running verification
- Trusting agent success reports without checking

**No exceptions. Run the command. Read the output. Then claim.**
