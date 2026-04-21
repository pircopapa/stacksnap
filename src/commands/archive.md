# archive / unarchive

Export a template as a portable `.zip` file and restore it later.

## Commands

### `stacksnap archive <name>`

Creates a zip archive of the named template.

**Options**

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--output` | `-o` | Directory to write the zip file into | `cwd` |

**Example**

```bash
stacksnap archive react-ts --output ./backups
# → Archived "react-ts" to ./backups/react-ts.zip
```

---

### `stacksnap unarchive <file>`

Restores a template from a previously created zip archive.

**Options**

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--name` | `-n` | Name for the restored template | zip basename |

**Example**

```bash
stacksnap unarchive ./backups/react-ts.zip
# → Unarchived "react-ts" to ~/.stacksnap/templates/react-ts

stacksnap unarchive ./backups/react-ts.zip --name react-ts-v2
# → Unarchived "react-ts-v2" to ~/.stacksnap/templates/react-ts-v2
```

## Notes

- Archives include all template files and `meta.json`.
- Unarchiving into an existing template name will fail; use `--name` to avoid conflicts.
- Combine with `snapshot` for versioned backups before destructive operations.
