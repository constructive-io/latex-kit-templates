---
name: latex-kit-starter-kits
description: Start a latex-kit project or workspace from a starter kit with latex-kit init or pgpm init, and write your own starters. Use when asked to "start a documents project", "scaffold a latex-kit project", "create a workspace for document templates", "add documents and PDFs to this repo", "add a template package", "latex-kit init", "make our own starter for documents", or "run latex-kit init non-interactively in CI".
compatibility: Node 22+; latex-kit 0.6.2+ for init --template, or pgpm; git, to fetch a starter
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Starting from a starter kit

```sh
latex-kit init my-documents --template project
```

Starters live in [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates). They are cloned once and cached under `~/.latex-kit`.

| Starter | Makes | Use it when |
|---|---|---|
| `project` | One folder: templates, data, records, a letter and an agreement two parties sign | There are a few documents, or documents are being added to a repository that already exists. It is self-contained, so it can sit inside any pnpm workspace as one more package |
| `workspace` | A pnpm workspace: the templates as a package, a project that builds every one of them, bundles, CI | Several projects will share the templates |
| `module` | One more template package | Inside a workspace, from its `packages/` folder |

`latex-kit init` with no `--template` is different: it writes a small letter project from files built into the CLI, with no network. `latex-kit init --paper` starts a paper.

## Answering the questions

A starter asks a few things (author, npm scope). Any of them can be a flag, and `--no-tty` never prompts:

```sh
latex-kit init my-documents --template project --fullName "Ada Marsh" --no-tty
latex-kit init my-templates --template workspace \
  --fullName "Ada Marsh" --email ada@example.test --username my-scope --no-tty
cd my-templates/packages && latex-kit init invoices --template module --no-tty
```

The folder's name becomes the package or workspace name. With `--no-tty`, or `CI=true`, a question with no flag and no default is an error, not a prompt.

The same repository works with pgpm:

```sh
pgpm init --repo constructive-io/latex-kit-boilerplates --template project --moduleName my-documents
pgpm init workspace --repo constructive-io/latex-kit-boilerplates --template workspace --name my-templates
```

## After it is made

```sh
cd my-documents && pnpm install
pnpm check      # templates, schemas and records agree: no TeX needed
pnpm draft      # needs Docker; `pnpm doctor` says whether the machine is ready
```

Every name, address and amount in a starter is made up. Replace them before building anything real. The `latex-kit` skill covers writing templates and records.

## Your own starters

`--repo <org/repo|git URL|folder>` starts from another repository, `--from-branch <name>` from a branch of it. The shape is the one `pgpm init --repo` reads:

```
my-starters/
  .boilerplates.json          { "dir": "." }
  contracts/
    .boilerplate.json         type, questions, skills
    package.json              with ____placeholders____
    templates/…
```

```json
{
  "type": "generic",
  "requiresWorkspace": false,
  "questions": [
    { "name": "____fullName____", "message": "Who keeps these documents", "defaultFrom": "git.user.name", "required": true }
  ],
  "skills": [{ "source": "constructive-io/latex-kit", "skills": ["latex-kit", "latex-kit-sign"] }]
}
```

- **Placeholders** are four underscores each side, in file contents and file names: `____moduleName____`.
- **`type`** is `generic` (stands alone), `workspace`, or `module` (with `"requiresWorkspace": "pnpm"`).
- **`defaultFrom`** offers a default: `git.user.name`, `git.user.email`, `npm.whoami`, `workspace.dirname`. **`setFrom`** takes a value from the surrounding workspace without asking.
- **`skills`** are copied into the new folder's `.agents/skills/`.
- A `.motd` file is printed after scaffolding and not kept.

Test a starter the way a person would use it: scaffold it with `--no-tty`, check that no `____` is left, install, and run its checks. `scripts/verify.sh` in latex-kit-boilerplates does exactly this.

## Related skills

- `latex-kit`: write the templates and records.
- `latex-kit-sign`: get the built PDFs signed.
