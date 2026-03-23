# /review — Request Code Review

## 1. Collect Changes
```bash
git diff --name-only main...HEAD
git diff --stat main...HEAD
git diff main...HEAD
```

## 2. Generate Review Request

```markdown
## Review Request

### Change Overview
- Purpose: [from commit message]
- Scope: [X files, +Y/-Z lines]

### Changed Files
| File | Type | Description |
|------|------|-------------|

### Checks
- [ ] lint passes
- [ ] build passes
- [ ] no file >300 lines
- [ ] styles modular (not in globals)
- [ ] no hardcoded colors

### Focus Areas
[Parts needing careful review]
```

## 3. Run pr-reviewer agent

Call `pr-reviewer` for automated review.
