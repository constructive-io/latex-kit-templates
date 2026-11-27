---
name: latex-kit-review
description: Review a latex-kit document before it goes out — redline it against an earlier version, see which words came from the record, find what is missing, print the blank form, build another language, and produce the signed copy. Use when asked to "show what changed", "redline this agreement", "compare to the last version", "diff the contract", "what did the record fill in", "what is still missing", "does this name fit in the signature block", "build the Japanese version", "make the signed copy", or before telling anyone a document is ready.
compatibility: Node 22+; Docker; latex-kit 0.6+; git, for redlines against a commit
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Reviewing a document

A check passing means the data fits the schema. It does not mean the document reads correctly. These are the copies to look at before saying it does.

| To see | Run | Writes |
|---|---|---|
| What changed since a commit | `latex-kit diff acme --against HEAD~1` | a redline PDF under `out/diff/` |
| What changed between two `.tex` files | `latex-kit diff old.tex new.tex` | the same |
| What came from the record | `latex-kit build acme --highlight` | `acme-highlight.pdf`: filled-in values in red |
| What is missing, as blanks | `latex-kit build acme --highlight --missing blank` | the same, with empty values as lines to fill in |
| The template with no data | `latex-kit build --variant blank --blanks lines` | each template as a form to write on |
| Every field's name in place | `latex-kit build --variant blank --blanks names` | `<template>-names.pdf` |
| Another language | `latex-kit build acme --locale ja-JP` | `acme-ja-JP.pdf` |

## Try it on the boilerplate

The `project` starter in [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates) has these wired up as scripts:

```sh
npx latex-kit init review-demo --template project --fullName "Ada Marsh" --no-tty
cd review-demo && pnpm install
pnpm review     # build --highlight --missing blank
pnpm names      # build --variant blank --blanks names
pnpm blank      # build --variant blank
```

## Redlines

```sh
latex-kit diff agreement-acme --against main        # this document now, against the same record on main
latex-kit diff agreement-acme --against v1.2.0 --variant final
```

latex-kit builds the document's `.tex` at that commit in a temporary git worktree, runs `latexdiff` on the two, and renders the result: deletions struck through, additions underlined. Everything that feeds the document is compared: the template, its clauses and snippets, and the record.

- The repository needs the earlier commit, so in CI check out with `fetch-depth: 0`.
- Commit, or at least save, before comparing: the new side is the working tree.
- A change that restructures a table or a list can confuse `latexdiff`. When the redline fails to build, compare `out/diff/<name>/old.tex` and `new.tex` by hand; both are kept.

## What to look for

Open each PDF. Then check, in this order:

1. **The highlighted copy.** Every red word came from the record. A name, date or amount in black was typed into the template and will be in every document; make it a `\field`.
2. **Missing values.** In a draft they are red `missing: path` markers. A final build refuses to run until they are filled in. Do not make a field optional to get past this unless the document really reads correctly without it.
3. **Signature blocks.** Long organization names, long titles and email addresses wrap. Build with the longest real values you expect and look at the block, on the page where it lands.
4. **Page breaks.** A heading alone at the foot of a page, a signature block separated from the last clause, a table split across pages.
5. **The blank form.** Titles and footers should print a bracketed label, not a line: `\formfield[blank=label,label={Company Name}]{…}`. A field that already sits on a rule wants `blank=none`.
6. **Clause references.** Each `\clauseref` should print a number that matches the section it names.

## Other languages

A template's `meta.locale` (or the record's `locale`) sets how dates, numbers and money print. `--locale ja-JP` builds another one beside the usual PDF without changing the record. The wording is whatever the template says; latex-kit does not translate.

## The signed copy

When a document was signed on paper or elsewhere and you need a clean copy that says so:

```yaml
# in the record
signed:
  provider: { date: "2026-11-25" }
  client: { date: "2026-11-26" }
```

```sh
latex-kit build acme --variant signed --signatures ~/signatures
```

Each signer's image is read from that folder (`<name>.png`, `.pdf` or `.jpg`); with no image the line reads `/s/ Name`. Keep the folder outside the repository: signature images are never committed. This prints a record of a signature that already happened. To collect signatures, use the `latex-kit-sign` skill.

## Related skills

- `latex-kit`: writing the template and records being reviewed.
- `latex-kit-sign`: getting the reviewed PDF signed.
- `latex-kit-reproducible-builds`: proving the PDF you reviewed is the PDF that was sent.
