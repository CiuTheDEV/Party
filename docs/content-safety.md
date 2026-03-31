# AI Content Extraction Safety + Quality Control

> On-demand loading. Trigger conditions live in `rules/behaviors.md`.

## AI Content Extraction Safety

### Source Attribution Requirements

**Trigger scenarios**:
- processing any external URL (tweet / article / video / doc)
- extracting key points, summarizing, or citing someone else's view

**Mandatory output format**:
```text
### [Content Title]
[Body text]
Source: [URL] - Paragraph X / Line Y
```

**Banned behaviors**:
- outputting unattributed "N key points from source"
- pattern-completing and disguising it as source content
- continuing without warning the user when verification failed

### Context Pollution Isolation (Auto-detect)

**Trigger conditions**:
1. Obvious factual error discovered
2. Hallucination signature detected
3. Memory conflict with previous records

**Auto-execute**:
```text
Detected output error/hallucination, executing context isolation:
1. Stop the current conversation on this topic
2. Suggest that the user starts a fresh conversation
3. Mark the error content so it will NOT be written to memory
```

**Banned**: continuing in the same session after finding the error, or writing error content to memory.

### Long Conversation Re-anchor (Auto-trigger)

**Trigger**: more than 20 conversation turns

**Auto-execute**:
```text
Conversation has been going for [N] turns, executing re-anchor check:
My current understanding of the task:
1. [Main goal]
2. [Key constraints]
3. [Completed parts]
Is this correct? Please point out any drift.
```

## Quality Control

- More than 20 turns or more than 50 tool calls -> proactively suggest a fresh session
- Critical business code -> must list 3 potential risk points

