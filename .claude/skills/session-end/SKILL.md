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

### 3. Update goals.md + projects.md

- Completed goals → remove (today.md has the record)
- Progress made → update description
- Status changes → update projects.md

### 4. Update memory/active-tasks.json

- Tasks progressed → update `context` / `next_action` / `updated` in `memory/active-tasks.json`
- New multi-session tasks → append
- Completed tasks → remove
- Stale >14 days → remind user

### 5. Update PROJECT_CONTEXT.md Handoff

Update `<!-- handoff:start/end -->` block.
Keep only latest + 1 previous handoff — delete older ones.

### 6. Git Commit

```bash
git add [specific files]  # Never git add .
git commit -m "[type]: [description]"
```

## Output Format

```
Experience: [Recorded N items / None needed]
today.md: updated
Tasks: [+N new / ~N updated / -N completed]
Handoff: updated
Committed: [N files]
```
