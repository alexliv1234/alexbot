# Config Management

This directory manages OpenClaw configuration in a git-tracked way.

## Structure

- `openclaw.template.json` - Sanitized config template (no secrets)
- `pending-bindings.json` - Bindings waiting for Alex's approval
- `applied-bindings.json` - History of applied bindings (for reference)

## Workflow

1. **Bot requests access** → I add to `pending-bindings.json`
2. **Alex approves** → I immediately apply binding + restart OpenClaw
3. **Done** → Binding moves to `applied-bindings.json` for history

**No intermediate steps** - approval = immediate activation.

## Security

- Real config with secrets stays at `~/.openclaw/openclaw.json` (not in git)
- Only sanitized template is tracked
- Alex controls when bindings are approved (which triggers restart)

---

*Created: 2026-02-07*
