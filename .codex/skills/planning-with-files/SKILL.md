---
name: planning-with-files
description: File-based planning for complex tasks. Use for multi-step tasks requiring >5 tool calls.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Planning with Files

```
Context Window = RAM (volatile, limited)
Filesystem = Disk (persistent, unlimited)
→ Anything important gets written to disk.
```

## Quick Start

Before ANY complex task:
1. Create `task_plan.md` — phases + acceptance criteria
2. Create `findings.md` — research storage
3. Create `progress.md` — session log
4. Define "done" before writing code
5. Re-read plan before every major decision
6. Update after each phase

## Critical Rules

- Never start complex task without `task_plan.md`
- After every 2 view/search operations → save key findings to file
- Every error goes in the plan file
- Never repeat a failed action — mutate approach

## 3-Strike Protocol

```
Attempt 1: diagnose + targeted fix
Attempt 2: different method
Attempt 3: question assumptions
After 3 failures: escalate to user with specific error
```

## When to use

**Use**: multi-step tasks, research, >5 tool calls
**Skip**: simple questions, single-file edits
