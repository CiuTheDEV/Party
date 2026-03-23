# /exploration — Solution Quality Check

Before writing code, challenge the solution's feasibility.

## When to use
- About to implement a new feature
- Multiple approaches available
- "Ready to code" but not sure

## Steps

1. Describe the solution in 1-2 sentences
2. CTO challenge mode:
   - "Why this approach instead of [alternative]?"
   - "What are the edge cases?"
   - "Is there a simpler way?"
   - "What tech debt does this introduce?"
   - "Does this fit the hub + module architecture?"
3. Explore existing code — find related patterns
4. Generate Go/No-Go:

```
## Exploration Conclusion

Feasibility: [High/Medium/Low]
Complexity: [High/Medium/Low]
Risk: [High/Medium/Low]

Key questions to answer first:
1. ...

Recommendation:
[ ] Go — ready to plan
[ ] Hold — resolve [issue] first
[ ] No-Go — suggest alternative: [reason]
```

"5 minutes of questioning beats 5 hours of fixing"
