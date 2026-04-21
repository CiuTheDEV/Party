---
name: session-end
description: Session wrap-up - update handoff + commit + record experience
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Session End — Wrap-up Workflow

> Trigger: `/session-end` or exit signals ("that's all for now" / "heading out" / "closing window")

## Core Rule

Do not treat session wrap-up as only `today.md + handoff + commit`.

Before finishing, always ask:
- Did this session change the architecture story?
- Did it add, remove, or reshape a reusable shared primitive?
- Did it introduce a new runtime pattern, module pattern, or verification expectation?
- Did any existing doc become stale because the code changed underneath it?

If the answer is yes, sync the affected docs in the same session.

## Steps

### 1. Experience Recording

Record if it meets any threshold:
- Reusable: next time with similar problem, can look it up
- Counter-intuitive: violates common assumptions
- High cost: took >10 minutes to solve

### 2. Update today.md

Append to `memory/today.md`:
```markdown
### SN (HH:MM~) [project/topic]
- [What was done]
- [Key decisions/discoveries]
- [Next steps]
- [Experience recorded: yes/no]
```

Rule:
- treat `memory/today.md` as the rolling log for the current week
- do not compress or prune the current week during ordinary session wrap-up
- at the week boundary, compress the finished week and move it to `memory/archive/`

### 3. Update goals.md + projects.md

- Completed goals → remove (today.md has the record)
- Progress made → update description
- Status changes → update projects.md

### 4. Update memory/active-tasks.json

- Tasks progressed → update `context` / `next_action` / `updated` in `memory/active-tasks.json`
- New multi-session tasks → append
- Completed tasks → remove
- Stale >14 days → remind user

### 5. Documentation Sync Pass

Review the docs that may have become stale because of the session.

At minimum, check whether the session changed:
- shared UI inventory or ownership → `docs/ui-map.md`
- runtime ownership or runtime verification expectations → `docs/runtime-map.md`
- new game scaffolding expectations → `docs/game-module-template.md` and `docs/new-game-checklist.md`
- shared extraction rules → `docs/shared-extraction-checklist.md`
- module readiness language → `docs/module-maturity.md`
- file organization / refactor rules → `docs/code-organization.md`
- repo doc routing / discovery → `docs/README.md`, `docs/agents.md`, `docs/task-routing.md`, `AGENTS.md`, `rules/behaviors.md`
- current architecture / phase / latest recommended references → `PROJECT_CONTEXT.md`

Rule:
- if a session adds or materially changes something reusable, update the relevant doc now
- do not leave docs a week behind the code
- if a doc was checked and is still accurate, no edit is needed, but the check must still happen

### 6. Update PROJECT_CONTEXT.md Handoff

Update `<!-- handoff:start/end -->` block.
Keep only latest + 1 previous handoff — delete older ones.

### 7. Git Commit

```bash
git add [specific files]  # Never git add .
git commit -m "[type]: [description]"
```

## Output Format

```
Experience: [Recorded N items / None needed]
today.md: updated
Tasks: [+N new / ~N updated / -N completed]
Docs: [synced / checked-no-change / updated N files]
Handoff: updated
Committed: [N files]
```
