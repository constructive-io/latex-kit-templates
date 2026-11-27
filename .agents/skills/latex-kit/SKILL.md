---
name: latex-kit
description: Make documents from templates and records with latex-kit — letters, agreements, forms, invoices, anything that is the same layout filled with different data. Use when asked to "make a contract template", "generate a PDF from data", "build an agreement", "fill in this form for these people", "make a blank form", "turn this document into a template", "add a field to the template", "why does latex-kit check fail", or when a document will be produced more than once with different names, dates or amounts.
compatibility: Node 22+; Docker to build PDFs (or a local TeX with --local); latex-kit 0.6+
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Documents from templates and records

A template is a LaTeX file with a few macros. A record is the data. latex-kit checks one against the other and builds the PDF.

```
templates/agreement/template.tex   the layout and wording   \
templates/agreement/schema.ts      what a record must hold   >  latex-kit build  ->  out/acme/acme.pdf
documents/acme.yaml                this document's data     /                        out/acme/acme.form.json
```

`acme.form.json` says where each party signs. `@latex-kit/sign` uses it.

## Start from the boilerplate

Do not start from an empty folder. [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates) has working starters, each with a letter, an agreement two parties sign, made-up records, and every command wired up:

```sh
npx latex-kit init my-documents --template project --fullName "Ada Marsh" --no-tty
cd my-documents && pnpm install
pnpm check      # works at once, with no TeX
```

| Starter | |
|---|---|
| `--template project` | One self-contained folder of documents. Also the way to add documents to a repository that already exists |
| `--template workspace` | The templates as a package that several projects share, with bundles and CI |
| `--template module` | One more template package inside a workspace |

Read the starter's `templates/agreement/template.tex` before writing your own: it shows a title that prints well as a blank form, optional text with `\when`, and signature blocks. The `latex-kit-starter-kits` skill covers the starters themselves, and `pgpm init --repo constructive-io/latex-kit-boilerplates` reads the same repository.

## Write the template

Write real LaTeX. Put a macro wherever something changes between documents:

| Macro | |
|---|---|
| `\field{client.name}` | A value. Filters: `\|date:long`, `\|money`, `\|paragraphs`, `\|upper`, `\|default:"…"` |
| `\raw{notes}` | A value inserted as LaTeX, **not** escaped. `latex-kit check` warns on every use |
| `\when{x}{…}\otherwise{…}` | Only when a value is there, or true |
| `\each{items}{item}{… \field{item.name} …}` | Once per entry in a list |
| `\snippet{letterhead}` | A shared piece from `snippets/` |
| `\signature{client}` | A signature block for a party |
| `\docid` | The document's ID |

Rules that save trouble:

- **Never type data into a template.** A name, a date or an amount in `template.tex` will be in every document. If it changes between documents, it is a `\field`.
- **Values are escaped for you.** `R&D 100%` in a record prints correctly. Do not escape in the data.
- **Escaping only touches data.** The template, snippets and clauses are ordinary LaTeX and are kept byte for byte. When a value is itself LaTeX (a formula, a pre-formatted block), use `\raw{path}` for that one value. A `\raw` value runs as TeX, so never use it for text that someone outside the project typed.
- **A party is an object:** `{ name, address, signer: { name, title, email } }` for an organization; a person has no `signer` and signs for themselves.

Turning an existing document into a template: `latex-kit import file.docx` (or `.md`, `.html`, `.tex`) makes a first pass; `{{x}}` becomes `\field{x}`. Then read it against the original.

## Say what the data is

`schema.ts` beside the template, in zod, using latex-kit's shared types:

```ts
import { ISODate, Money, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'AGR', title: 'Services agreement' };

export default z.object({
  effectiveDate: ISODate,
  provider: Party,
  client: Party,
  fee: Money,
  noticeDays: z.number().int().positive().optional(),
});
```

A new field needs three things: the `\field` in the template, the entry here, and a value in each record. `pnpm check` tells you which is missing.

## Write records

```yaml
# documents/acme.yaml
template: agreement
data:
  effectiveDate: "2026-01-15"
  provider: { $ref: orgs/example-co }     # data/orgs/example-co.yaml
  client: { $ref: orgs/acme }
  fee: { amount: 12000, currency: USD }
```

Anything used by more than one document goes in `data/` and is pulled in with `$ref`. `latex-kit new document acme --template agreement` writes a record with every required field.

## Build, and look

```sh
pnpm check      # templates, schemas, records: no TeX
pnpm draft      # with a DRAFT watermark; missing values show as red markers
pnpm final      # the finished PDF; mints the document's ID once and writes it into the record
pnpm blank      # the template as an empty form to write on
pnpm names      # the template with every field's name in brackets
pnpm review     # a draft with filled-in values in red and missing ones as blanks
```

Open the PDF before saying it is right. A check cannot see a heading stranded at the foot of a page, a long name wrapping badly in a signature block, or a table running off the edge. `pnpm review` is the quickest way to see what came from the record.

Never edit a `docId` or reuse one.

## Hints for forms and signing

`\formfield[hints]{content}` prints its content unchanged in a finished document:

```latex
% a blank form prints [Company Name] here instead of a line
\textbf{\formfield[blank=label,label={Company Name}]{\field{company.name}}}

% a spot of your own for someone to sign, outside a \signature block
\formfield[type=signature,who=witness,width=6cm]{}\rule{6cm}{0.4pt}
```

| Hint | |
|---|---|
| `blank=line`, `wide`, `none`, `label` (with `label={…}`) | How a blank prints here. Titles and footers want `label`; a field already sitting on a rule wants `none` |
| `type=signature`, `date`, `initials`, `text` with `who=<party>` | A spot for someone to fill in |
| `width=`, `height=`, `raise=` | That spot's box |

`\signature{party}` marks its own signature and date lines; `who` is the party's path (`client`).

## Getting it signed

`\signature` blocks and `\formfield[type=…,who=…]` spots are written to `<document>.form.json` by every build. The `latex-kit-sign` skill takes it from there.

## What this does not do

- It is not legal advice. Whether a document's wording is right for a purpose is for the person responsible to decide.
- It does not lay pages out for you: a template is LaTeX, and the layout is whatever its LaTeX says.

## Related skills

- `latex-kit-components`: tables, totals, exhibits, versioned clauses and typed records in TypeScript.
- `latex-kit-review`: redlines, review copies, other languages, the signed copy.
- `latex-kit-import`: turn a Word, Markdown, HTML or older LaTeX document into a template.
- `latex-kit-sign`: get a built PDF signed, or place its fields in another signing app.
- `latex-kit-reproducible-builds`: pins, engines, CI, and what to do when a build fails.
- `latex-kit-papers`: papers and plain `.tex` files.
- `latex-kit-starter-kits`: start a project or a workspace, and write your own starters.
