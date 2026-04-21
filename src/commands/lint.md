# `lint` and `lint-all` Commands

Lint templates for metadata issues and structural problems.

## Usage

```bash
stacksnap lint <template>
stacksnap lint-all [--strict]
```

## `lint <template>`

Checks a single template for:

- **Errors** (fail the command):
  - Template does not exist
  - `meta.json` cannot be parsed
  - Missing required fields (`name`, `description`)
  - `tags` field is not an array

- **Warnings** (informational):
  - Unknown fields in `meta.json`
  - `version` does not follow semver (`x.y.z`)
  - Template has no files besides `meta.json`

### Example

```bash
stacksnap lint my-node-app
# ✅ Template "my-node-app" passed lint with no issues.

stacksnap lint broken-tpl
# ❌ ERROR: Missing required field: "description"
# ⚠️  WARN: Unknown meta field: "homepage"
```

## `lint-all`

Runs lint across every installed template.

### Options

| Flag | Description |
|------|-------------|
| `--strict` | Treat warnings as errors (exits with code 1) |

### Example

```bash
stacksnap lint-all
# Scanned 5 template(s). Errors: 1, Warnings: 2
# Failed: broken-tpl

stacksnap lint-all --strict
# Treats warnings as failures
```

## Exit Codes

- `0` — All checks passed
- `1` — One or more errors found (or warnings in `--strict` mode)
