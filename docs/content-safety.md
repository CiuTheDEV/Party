# AI Content Extraction Safety + Quality Control

> On-demand loading. Trigger conditions in rules/behaviors.md.

## AI Content Extraction Safety

### Source Attribution Requirements

**Trigger scenarios**:
- Processing any external URL (tweet/article/video/doc)
- Extracting key points, summarizing, citing others' views

**Mandatory output format**:
```
### [Content Title]
[Body text]
Source: [URL] - Paragraph X / Line Y
```

**Banned behaviors**:
- Output unattributed "N key points from source"
- Pattern-complete then disguise as source content
- Cannot verify but continue outputting without warning user

### Context Pollution Isolation (Auto-detect)

**Trigger conditions**:
1. Obvious factual error discovered
2. Hallucination signature detected
3. Memory conflict with previous records

**Auto-execute**:
```
Detected output error/hallucination, executing context isolation:
1. Stopping current conversation on this topic
2. Suggesting user start fresh conversation
3. Marked error content — will NOT write to memory
```

**Banned**: Continuing in same session after finding error / Writing error to memory

### Long Conversation Re-Anchor (Auto-trigger)

**Trigger**: >20 conversation turns

**Auto-execute**:
```
Conversation has been going for [N] turns, executing re-anchor check:
My current understanding of the task:
1. [Main goal]
2. [Key constraints]
3. [Completed parts]
Is this correct? Please point out any drift.
```

## Quality Control

- >20 turns or >50 tool calls → Proactively suggest fresh session
- Critical business code → Must list 3 potential risk points
