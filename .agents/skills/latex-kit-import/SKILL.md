---
name: latex-kit-import
description: Turn an existing document into a latex-kit template — a Word, Markdown or HTML file, or an older .tex with placeholders. Use when asked to "turn this Word document into a template", "convert our contract to latex-kit", "import this .docx", "migrate our old LaTeX templates", "make this agreement reusable", "templatize this document", or when someone hands over a finished document and wants more like it.
compatibility: Node 22+; Docker (pandoc runs in a pinned image); latex-kit 0.6+
metadata:
  author: constructive-io
  version: "0.1.0"
---

# From an existing document to a template

```sh
latex-kit import offer-letter.docx              # .docx, .md, .html through pandoc; .tex directly
latex-kit import old/agreement.tex --name services-agreement
```

This writes `templates/<name>/template.tex` and a starter `schema.ts` listing every placeholder it found. `{{client.name}}` and `@CLIENT@NAME@` become `\field{client.name}`. `--force` replaces a template that exists; `--no-schema` leaves the schema alone.

Import is a first pass. The work is what comes after it.

## Import into the boilerplate

Start a project from [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates), then import into it, so the result builds at once beside a working example:

```sh
npx latex-kit init my-documents --template project --fullName "Ada Marsh" --no-tty
cd my-documents && pnpm install
pnpm exec latex-kit import ~/Downloads/offer-letter.docx
pnpm check
```

Read the starter's `templates/agreement/template.tex` first: it is what the finished template should look like.

## Before importing: a document with real names in it

A finished contract has no placeholders, only one party's details. Do not import it and hunt for the names afterwards; they are easy to miss.

1. Copy the document.
2. In the copy, replace everything that changes between documents with `{{a.path}}`: `{{client.name}}`, `{{effectiveDate}}`, `{{fee}}`.
3. Import the copy.
4. Search the template for anything left: the names, the amounts, the dates, the addresses, an email domain.

A template in a shared or public repository must not carry the names, amounts or terms of a real deal. Records hold those, and records with real data belong somewhere private.

## After importing

1. **Read it against the original**, side by side. pandoc keeps wording and structure; it drops or approximates layout: letterheads, columns, tab-aligned text, numbered-clause styles, footers.
2. **Fix the structure by hand.** Headings become `\section`s. A title should be a heading, not a bold paragraph. A signature table becomes `\signature{client}\hfill\signature{provider}`.
3. **Type the schema.** The starter schema makes every field a string. Change dates to `ISODate`, amounts to `Money`, parties to `Party`, and mark what is optional.
4. **Turn alternatives into `\when`.** "[Delete if not applicable]" and bracketed options in the original are conditions: `\when{mutual}{Each party}\otherwise{The Recipient}`.
5. **Move repeated wording out.** A letterhead goes in `snippets/`; a clause shared by several agreements goes in `clauses/` (the `latex-kit-components` skill).
6. **Write one record with made-up data** (`latex-kit new document sample --template <name>`), then `pnpm check` and `pnpm draft`.
7. **Build the blank and the highlighted copy** and look at both: `pnpm blank`, `pnpm review`. Anything in black that should have been red was missed in step 4 above.

## Older LaTeX templates

For a `.tex` that used `\newcommand` values or search-and-replace tokens, import rewrites `{{x}}` and `@GROUP@FIELD@` only. Replace other schemes yourself: delete the `\newcommand{\clientname}{…}` definitions and put `\field{client.name}` where `\clientname` was used. Keep the preamble; a latex-kit template is still the same LaTeX document.

## Related skills

- `latex-kit`: the template language and schemas.
- `latex-kit-review`: comparing the result against the original.
