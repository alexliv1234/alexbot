# Config Management

This directory manages OpenClaw configuration in a git-tracked way.

## Structure

- `openclaw.template.json` - Sanitized config template (no secrets)
- `pending-bindings.json` - Bindings waiting for Alex's approval
- `approved-bindings.json` - Approved bindings ready to apply
- `apply-bindings.sh` - Script to apply approved bindings to config

## Workflow

1. **Bot requests access** → I add to `pending-bindings.json`
2. **Alex reviews** → Moves approved to `approved-bindings.json`
3. **Apply** → Run `./apply-bindings.sh` to update config and restart

## Security

- Real config with secrets stays at `~/.openclaw/openclaw.json` (not in git)
- Only sanitized template is tracked
- Alex controls when restarts happen

---

*Created: 2026-02-07*
