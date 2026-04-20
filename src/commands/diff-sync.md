# diff & sync commands

Two companion commands for comparing and reconciling templates with existing project directories.

## `stacksnap diff <template> <target>`

Compares a saved template against an existing directory and reports:

- Files present in the template but missing from the target (`+`)
- Files present in the target but not in the template (`-`)
- Files present in both but with differing content (`~`)

### Options

| Flag | Alias | Description |
|------|-------|-------------|
| `--files-only` | `-f` | Skip content comparison, only check file presence |

### Example

```bash
stacksnap diff node-api ./my-project
stacksnap diff node-api ./my-project --files-only
```

---

## `stacksnap sync <template> <target>`

Copies files from a template into an existing project directory. By default, only missing files are added.

### Options

| Flag | Alias | Description |
|------|-------|-------------|
| `--dry-run` | `-d` | Preview changes without writing anything |
| `--overwrite` | `-o` | Also overwrite files that already exist |

### Example

```bash
stacksnap sync node-api ./my-project
stacksnap sync node-api ./my-project --overwrite
stacksnap sync node-api ./my-project --dry-run
```

---

Both commands rely on `walkDir` from `preview.js` for recursive file listing.
