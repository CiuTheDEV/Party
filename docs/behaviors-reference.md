# Behavior Rules - Reference Details (On-demand loading)

> Core rules live in `rules/behaviors.md`. Detailed operation guides live here.

## Memory Search - Scope Routing Table

**No unscoped global search.**

| Keywords | Collection |
|----------|-----------|
| Project Party / game / hub / charades | `project-party` |
| Memory / patterns / recall / pitfalls | `memory` or `patterns` |
| Not sure | Start with `memory`, expand if needed |

### Code / Project Search: Two-stage RAG

When finding "where is this feature":
1. **L0** Run `ls` or `find . -maxdepth 2` first to locate candidate directories (5 or fewer)
2. **L1** Search only within those candidates using `grep`

Banned: unscoped full-text search across the entire project.

## Post-compression Re-anchor

After context compression:
1. Search current task keywords (specify collection)
2. If still not enough, read `memory/today.md`
3. Only re-read `PROJECT_CONTEXT.md` for project-level decisions

Do not trigger this if context is still clear - avoid wasting tokens.

---

*Split from `rules/behaviors.md`.*

