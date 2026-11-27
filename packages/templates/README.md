# @latex-kit/templates

> **Not legal advice.** These templates are examples and starting points for drafting. They were not prepared for your situation or reviewed for any jurisdiction, and they may be wrong, incomplete or out of date. Using them creates no lawyer-client relationship. Have a qualified lawyer review any document before you rely on it or sign it. Provided "as is", with no warranty, at your own risk. The full text is in [DISCLAIMER.md](DISCLAIMER.md).

Templates: `letter`, `invoice`, `agreement` (services), `nda`.

Document templates for [latex-kit](https://github.com/constructive-io/latex-kit), as a package: another project installs it and builds from it.

| Folder | |
|---|---|
| `templates/<name>/` | `template.tex`, `schema.ts`, and the generated `<name>.schema.json` and `types.d.ts` |
| `snippets/` | Pieces shared between templates |
| `clauses/` | Versioned clauses for `\clause{id}` |
| `components/` | TypeScript for computed parts, such as the invoice's table |
| `bundles/` | Sets of templates that go out together, filled from one record |

A project uses it by pointing its `latex-kit.config.ts` at the installed package; see `project/` in this workspace.
