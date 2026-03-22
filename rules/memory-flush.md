# Memory Flush

> Don't rely on user triggers — auto-save. User might close the window at any time.

## Trigger Conditions

- **Non-trivial task starts** → Immediately write today.md session header: `### SN (~HH:MM) [project] Working on XXX...`
- Each task completed → Update today.md
- Each code commit → Update PROJECT_CONTEXT.md
- Architecture/strategy decision → Immediately record in today.md

## Exit Signals (Execute full flush immediately)

"That's all for now" / "Done for today" / "I'm heading out" / "Talk later" / "Closing window" → Immediately run session-end

Banned: Waiting for /session-end to save / Batching saves / Assuming user will end normally
