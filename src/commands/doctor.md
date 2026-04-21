# `stacksnap doctor`

Runs a series of health checks on your stacksnap setup and reports any issues.

## Usage

```bash
stacksnap doctor
```

## What It Checks

| Check | Description |
|---|---|
| Config file readable | Verifies the config file exists and can be parsed |
| Templates directory exists | Confirms the configured templates directory is present on disk |
| Templates found | Lists how many templates were discovered |
| Template meta (per template) | Validates that each template has required fields: `name`, `description`, `version` |

## Output

Each check is shown with a ✅ or ❌ icon:

```
✅ Config file readable
✅ Templates directory exists (/home/user/.stacksnap/templates)
✅ Templates found (3)
✅ Template "react-app" meta
❌ Template "old-thing" meta (Missing: version)

Some checks failed. Review the issues above.
```

## Exit Code

- `0` — all checks passed
- `1` — one or more checks failed

## Related Commands

- `stacksnap validate <template>` — deep validation of a single template
- `stacksnap audit <template>` — security and quality audit
- `stacksnap list` — list all available templates
