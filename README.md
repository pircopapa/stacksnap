# stacksnap

> CLI tool to scaffold opinionated project structures from reusable templates

---

## Installation

```bash
npm install -g stacksnap
```

---

## Usage

Run the interactive scaffolder in any directory:

```bash
stacksnap init
```

Or specify a template directly:

```bash
stacksnap init --template react-ts my-app
```

This will generate a fully structured project under `./my-app` based on the chosen template.

### Available Commands

| Command | Description |
|---|---|
| `stacksnap init` | Scaffold a new project interactively |
| `stacksnap list` | List all available templates |
| `stacksnap add <template>` | Add a community template |

---

## Example

```bash
$ stacksnap init --template node-api my-backend

✔ Template fetched
✔ Dependencies installed
✔ Project ready at ./my-backend

Happy building! 🚀
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](./LICENSE)