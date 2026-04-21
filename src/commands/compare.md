# `stacksnap compare`

Compare two templates to identify differences in metadata and file structure.

## Usage

```bash
stacksnap compare <templateA> <templateB> [options]
```

## Arguments

| Argument    | Description              |
|-------------|--------------------------|
| templateA   | Name of the first template  |
| templateB   | Name of the second template |

## Options

| Flag         | Alias | Default | Description                          |
|--------------|-------|---------|--------------------------------------|
| `--meta`     | `-m`  | `true`  | Show differences in `meta.json`      |
| `--files`    | `-f`  | `false` | Show file list differences           |

## Examples

```bash
# Compare metadata of two templates
stacksnap compare react-app vue-app

# Compare file lists only
stacksnap compare react-app vue-app --files --no-meta

# Compare both metadata and files
stacksnap compare react-app vue-app --meta --files
```

## Output

When comparing metadata, each differing field is shown with the value from each template.
When comparing files, the command shows files unique to each template and the count of shared files.

## Notes

- Both templates must exist in the configured templates directory.
- Use `stacksnap list` to see available templates.
- Use `stacksnap diff` to compare a template against a scaffolded project directory.
