# `stacksnap prune`

Remove templates that have not been used within a configurable number of days, helping keep your template library tidy.

## Usage

```bash
stacksnap prune [--days <n>] [--dry-run]
```

## Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--days` | `-d` | `90` | Unused threshold in days |
| `--dry-run` | `-n` | `false` | Preview removals without deleting |

## How it works

1. Loads the usage history from the stacksnap config.
2. For each template in the templates directory, finds the most recent usage date.
3. Templates with no history entry **or** a last-used date older than `--days` are considered eligible.
4. Without `--dry-run`, eligible templates are permanently deleted from disk.

## Examples

```bash
# Preview templates unused for 60+ days
stacksnap prune --days 60 --dry-run

# Delete templates unused for the default 90 days
stacksnap prune

# Aggressively prune anything unused in the last 30 days
stacksnap prune --days 30
```

## Notes

- Pinned templates are **not** exempt from pruning — run `stacksnap pinned` first to review what is pinned before pruning.
- Pruned templates cannot be recovered unless you have exported or snapshotted them beforehand.
