# latex-kit-templates — agent guide

Templates as a package (`packages/templates`) and a project that builds them (`project/`), with [latex-kit](https://github.com/constructive-io/latex-kit). [README.md](./README.md) lists the macros and commands.

Seven skills came with this folder, in `.agents/skills/`. Read the one that fits before working:

- `latex-kit`: writing templates, schemas and records; building, blank forms.
- `latex-kit-components`: tables, totals and exhibits in TypeScript; versioned clauses; typed records.
- `latex-kit-review`: redlines, what the record filled in, other languages, the signed copy.
- `latex-kit-import`: turning a Word, Markdown, HTML or older LaTeX document into a template.
- `latex-kit-sign`: getting a PDF signed, or placing its fields in another signing app.
- `latex-kit-reproducible-builds`: pins, engines, CI, and a build that will not run.
- `latex-kit-starter-kits`: starting more projects or template packages.

## Rules

- **This repository is public, and its templates are read by strangers as if they were forms to use.** The disclaimers live in the README's caution block and `DISCLAIMER.md`, and they stay. The templates themselves carry none: no "not legal advice" comments or printed notices inside a `.tex` file. Never write that a template is complete, safe, standard, enforceable or lawyer-approved.
- **Only original wording.** Never copy a template, clause or sentence from a private repository, a law firm's form, a client's paper or a real contract. If you are asked to add a template that came from one of those, stop and ask the person you work for where the text came from and whether it may be published.
- **Invented names only** in records, examples and tests: no real people, companies, addresses or amounts.
- **A template is LaTeX.** Only the macros in the README are replaced; everything else is kept byte for byte.
- **Data goes in records, never in templates.** A name, date or amount typed into `template.tex` will be in every document built from it.
- **A new field needs three things:** `\field{…}` in the template, an entry in `schema.ts`, and a value in each record. Then `pnpm typegen`, and commit what it writes.
- **Never edit a document's `docId`,** and never reuse one.
- **Do not install latex-kit globally.** Use the root scripts, or `pnpm exec latex-kit … --root project`.
- **Nothing built is committed.** `out/` and `.latex-kit-sign/` are ignored; the second holds signers' details.
- **Do not send signing links or email anyone** unless the person you work for asked for exactly that.

## Before you say it is done

```sh
pnpm check      # must pass
pnpm draft      # must build every document
```

Then open the PDF you changed and say what you looked at.
