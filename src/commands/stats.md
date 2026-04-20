# `stacksnap stats` — Template Usage Statistics

## Overview

The `stats` command provides a quick overview of how frequently each template
has been used, pulling data from the usage history stored in the config.

## Usage

```bash
# Show stats for all templates
stacksnap stats

# Show stats for a specific template
stacksnap stats --template react-app
stacksnap stats -t express-api
```

## Output Example

```
Template usage statistics:

  react-app                        12 use(s)  (last used 2024-03-15)
  express-api                       5 use(s)  (last used 2024-02-20)
  vue-app                           2 use(s)  (last used 2024-01-10)
  next-app                          0 use(s)  (never used)
```

## Implementation Notes

- History is read from `config.history` (array of `{ template, date }` objects).
- The core aggregation logic lives in `src/stats.js` and is independently testable.
- Templates with zero recorded uses are still listed so you know they exist.
- Results are sorted descending by use count.

## Related Commands

- `history` — view the raw usage log
- `use`     — scaffold a project and record history
- `search`  — find templates by name or description
