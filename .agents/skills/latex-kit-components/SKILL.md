---
name: latex-kit-components
description: Compute parts of a latex-kit document in TypeScript — tables, totals, repeated signature blocks, exhibits, bilingual names, versioned clauses and typed records. Use when asked to "add a line-items table", "compute the total in the document", "make an invoice template", "add an exhibit", "write a component", "reuse this clause across agreements", "version our clauses", "type the record", "get autocomplete in the record", or when a template needs logic that \when and \each cannot express.
compatibility: Node 22+; latex-kit 0.6+
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Components, clauses and typed records

Long prose stays in `.tex`. Anything that is easier to compute than to write goes in TypeScript.

```
components/line-items.ts    \component{line-items}{}        a function from data to LaTeX
clauses/nda/term.tex        \clause{nda/term}               a numbered, versioned clause
clauses/nda/assignment.ts   \clause{nda/assignment}         the same, in TypeScript
documents/invoice-0001.ts   a record that computes its own totals
```

## Start from the boilerplate

[constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates) has working projects to add these to:

```sh
npx latex-kit init my-documents --template project --fullName "Ada Marsh" --no-tty
cd my-documents && pnpm install && pnpm check
```

The starter has no `components/` or `clauses/` folder yet. Create them beside `templates/`; latex-kit finds them by name. A finished invoice with a component, an NDA made of clauses and a TypeScript record are in [examples/workspace](https://github.com/constructive-io/latex-kit/tree/main/examples/workspace).

## A component

`components/line-items.ts`:

```ts
import { defineComponent, money, table } from 'latex-kit';

export default defineComponent((data: any, ctx) =>
  table(
    data.items,
    [
      { header: 'Description', value: 'description' },
      { header: 'Qty', value: 'quantity', format: 'number', align: 'r' },
      { header: 'Amount', value: 'amount', format: 'money:USD', align: 'r' },
    ],
    ctx,
    { footer: [['Total', '', money(ctx, data.total, 'USD')]] }
  )
);
```

```latex
\component{line-items}{}        % the whole record
\component{line-items}{order}   % or the value at a path
```

- **Return `tex`-tagged LaTeX or a plain string.** In a `tex` template the interpolated values are escaped and the literal LaTeX around them is not: ``tex`\textbf{${name}}` ``. A plain string is escaped whole. Never build LaTeX by joining strings with data in them. For a value that is already LaTeX and must pass through untouched, wrap it in `raw(value)`.
- `ctx` has the variant, locale, document ID and whole record, plus `ctx.format(value, 'money:USD')` (the template filters), `ctx.signature(party)` and `ctx.missing('path')`.
- **A blank build calls a component with no value.** The helpers print labelled blanks; a component of your own must cope with `undefined`. Run `pnpm blank` after writing one.

Built in, with no file needed:

| | Value | Prints |
|---|---|---|
| `\component{signatures}{parties}` | a list of parties | signature blocks, two side by side |
| `\component{exhibits}{exhibits}` | a list of `{ title, body }` | each on a new page: Exhibit A, Exhibit B, … |
| `\component{bilingual}{company.name}` | `{ en, ja }` | the record's language first |
| `\component{address}{client.address}` | an address | one part per line |

Helpers exported from `latex-kit`: `table`, `exhibit`, `signatures`, `bilingual`, `address`, `money`, `date`, `number`, `percent`, `get`, `tex`, `raw`, `escapeLatex`.

## Clauses

A clause is wording used by more than one template, with a title and a version:

```latex
% clauses/nda/term.tex
% title: Term
% version: 2
This Agreement lasts \field{termMonths|words} (\field{termMonths}) months,
subject to Section~\clauseref{nda/exclusions}.
```

`\clause{nda/term}` places it as a numbered section, filled with the document's data. `\clauseref{nda/term}` prints its number, so cross-references survive reordering. A reference to a clause the document does not contain fails a final build.

Raise `version` whenever the wording changes. Each build's manifest in `out/<document>/` lists the clause IDs and versions it used, which is how you answer "which wording did they sign?".

The same in TypeScript, when the wording depends on data in ways `\when` makes hard to read:

```ts
// clauses/nda/assignment.ts
import { defineClause } from 'latex-kit';

export default defineClause({
  title: 'Assignment',
  version: 1,
  body: 'Neither party may assign this Agreement. \\when{mutual}{It binds both parties.}',
});
```

`body` is template text and is checked like any clause. `render: (data, ctx) => tex\`…\`` builds it in code instead.

## Typed records

`pnpm typegen` writes `<template>.schema.json` and `types.d.ts` beside each schema. YAML and JSON records get editor autocomplete from the first. A record can also be TypeScript:

```ts
// documents/invoice-0001.ts
import { defineDocument, ref } from 'latex-kit';
import type { InvoiceData } from '../templates/invoice/types';

const items = [{ description: 'Widgets', quantity: 12, unitPrice: 450 }].map((i) => ({ ...i, amount: i.quantity * i.unitPrice }));

export default defineDocument<InvoiceData>({
  template: 'invoice',
  docId: 'INV-20261125-7QX2M9KD',
  data: { from: ref('orgs/example-co'), to: ref('orgs/acme'), items, total: items.reduce((s, i) => s + i.amount, 0) },
});
```

- **Do the arithmetic in the record or a component, never in the template.** The template only formats.
- **latex-kit never edits code**, so a TypeScript record's `docId` is written by hand. YAML and JSON records have theirs minted by the first final build.
- Commit the generated files and rerun `pnpm typegen` when a schema changes; the workspace starter's CI fails when they are stale.

## Related skills

- `latex-kit`: templates, schemas, records and builds.
- `latex-kit-review`: see what a change to a clause did to a document.
