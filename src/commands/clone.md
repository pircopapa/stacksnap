# `clone` and `clones` commands

## Overview

The `clone` command lets you duplicate an existing template under a new name. The cloned template gets a `clonedFrom` field added to its `meta.json` so the lineage is tracked.

The `clones` command lets you inspect those relationships — either listing all clones across every template, or filtering by a specific source.

---

## Usage

### Clone a template

```bash
stacksnap clone <source> <destination>
```

**Options:**

| Flag | Alias | Description |
|------|-------|-------------|
| `--overwrite` | `-o` | Overwrite the destination if it already exists |

**Examples:**

```bash
# Clone "react-base" into a new template called "react-ts"
stacksnap clone react-base react-ts

# Clone and overwrite an existing template
stacksnap clone react-base react-ts --overwrite
```

---

### List clones

```bash
stacksnap clones [source]
```

**Examples:**

```bash
# Show all clone relationships
stacksnap clones

# Show only templates cloned from "react-base"
stacksnap clones react-base
```

---

## Notes

- Cloning copies all files recursively, including nested directories.
- The `meta.json` in the cloned template will have its `name` field updated to match the destination and a `clonedFrom` field added.
- Locking (`stacksnap lock`) is respected — locked templates cannot be overwritten.
