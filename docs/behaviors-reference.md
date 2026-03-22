# Behavior Rules — Reference Details (On-demand loading)

> Core rules in `rules/behaviors.md`. Detailed operation guides here.

## Memory Search — Scope Routing Table

**No unscoped global search.**

| Keywords | Collection |
|----------|-----------|
| Project Party / game / hub / charades | `project-party` |
| Memory / patterns / recall / pitfalls | `memory` or `patterns` |
| Not sure | Start with `memory`, expand if needed |

### Code/Project Search: Two-stage RAG

When finding "where is this feature":
1. **L0** First `ls` or `find . -maxdepth 2` to locate candidate directories (≤5)
2. **L1** Only search within candidates using `grep`

Banned: Unscoped full-text search across entire project.

## Post-compression Re-anchor

After context compression:
1. Search current task keywords (specify collection)
2. Still not enough → read `memory/today.md`
3. Only re-read `PROJECT_CONTEXT.md` for project-level decisions

Don't trigger if not fuzzy — avoid wasting tokens.

---

*Split from rules/behaviors.md*
