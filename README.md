# latex-kit-templates

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/latex-kit-templates/actions/workflows/documents.yml">
    <img height="20" src="https://github.com/constructive-io/latex-kit-templates/actions/workflows/documents.yml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/latex-kit-templates/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
</p>

<p align="center">Starting-point document templates for <a href="https://github.com/constructive-io/latex-kit">latex-kit</a>.</p>

> [!CAUTION]
> **These templates are not legal advice.** They are examples and starting points for drafting. Nobody here is your lawyer, and using them creates no lawyer-client relationship. They were not prepared for your situation or reviewed for any jurisdiction, and they may be wrong, incomplete or out of date. **Have a qualified lawyer review any document before you rely on it, sign it, or ask someone else to sign it.** Everything is provided "as is", with no warranty, and you use it entirely at your own risk. Read the full [DISCLAIMER](DISCLAIMER.md) first.

## The templates

| Template | What it is |
|---|---|
| [`letter`](packages/templates/templates/letter) | A letter on a shared letterhead |
| [`invoice`](packages/templates/templates/invoice) | An invoice with a line-items table and totals |
| [`agreement`](packages/templates/templates/agreement) | A short services agreement two parties sign |
| [`nda`](packages/templates/templates/nda) | A non-disclosure agreement, one-way or mutual, built from versioned clauses |

Each one is deliberately short. It shows how a document of that kind is laid out, filled from data and signed with latex-kit. It is not a complete or recommended form of that document. Every name, address and amount in the sample records is made up.

## Use them

In a latex-kit project of your own:

```sh
pnpm add -D latex-kit @latex-kit/templates
```

```ts
// latex-kit.config.ts
import { defineConfig } from 'latex-kit';

const pkg = 'node_modules/@latex-kit/templates';

export default defineConfig({
  templates: `${pkg}/templates`,
  snippets: `${pkg}/snippets`,
  clauses: `${pkg}/clauses`,
  components: `${pkg}/components`,
});
```

Or copy a template folder into your own `templates/` and change the wording, which is what most people should do: a contract is yours once you have had it reviewed, and it should not change under you when a package updates.

No project yet? `npx latex-kit init my-documents --template project` starts one from [latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates).

## Work on them here

Every name, address and amount here is made up.

```sh
pnpm install
pnpm check      # templates, schemas, records and bundles agree (no TeX needed)
pnpm draft      # project/out/<document>/<document>-draft.pdf
pnpm final      # finished PDFs; mints each document's ID once
```

Building needs Docker. `pnpm doctor` says whether this machine is ready.

### What is here

| | |
|---|---|
| `packages/templates/` | `@latex-kit/templates`: the templates, snippets, clauses, components and bundles |
| `project/` | A latex-kit project that installs that package and builds from it: `data/`, `documents/`, `out/` |
| `scripts/bundles.mjs` | Checks bundles, and starts a set of documents from one |

The templates are a package so other projects can use them: by `workspace:*` here, or from npm once you publish it. The project reads them from `node_modules`, exactly as an outside project would.

### Other ways to print a template

```sh
pnpm blank      # an empty form to write on
pnpm names      # every field's name in brackets
pnpm review     # drafts with filled-in values in red, and missing ones as blanks
```

### Write a template

A template is a real `.tex` file. latex-kit fills in a few macros and leaves every other byte alone:

| Macro | |
|---|---|
| `\field{client.name}` | A value from the record. Filters: `\field{fee\|money}`, `\field{date\|date:long}`, `\field{body\|paragraphs}` |
| `\when{noticeDays}{…}\otherwise{…}` | Print something only when a value is there |
| `\each{items}{item}{…}` | Repeat for every entry in a list |
| `\snippet{letterhead}` | A shared piece from `snippets/` |
| `\signature{client}` | A signature block for a party. It also marks where they sign |
| `\formfield[blank=label,label={Client}]{…}` | How a blank form prints this spot, or `type=`/`who=` to mark your own spot to sign |
| `\docid` | The document's ID |

`schema.ts` beside it says what the record must hold (zod). `pnpm check` compares every template, schema and record without running TeX.

After changing a `schema.ts`, run `pnpm typegen` and commit what it writes.

### Bundles

A bundle is a set of templates that go out together, filled from one shared record:

```sh
pnpm bundle new welcome acme      # one record in project/data/engagements/, one document per template
```

### Builds and releases

`.github/workflows/documents.yml` runs on GitHub with nothing to set up:

- **Every push and pull request:** checks the templates and records, builds every template as an empty form and every document as a draft, and keeps the PDFs as a download on the run (the `documents` artifact).
- **Every tag like `v1.0.0`:** attaches the PDFs to a GitHub release: each empty form, and the finished copy of every document that has a `docId`.

```sh
git tag v1.0.0 && git push --tags
```

A document gets its `docId` the first time you run `pnpm final` yourself; commit the record afterwards. Until then it is left out of releases, because an ID minted on a build machine would be thrown away. Built PDFs are never committed.

### Get one signed

A final build of the agreement also writes `agreement-sample.form.json`: the page and position of each signature and date line. Two ways to use it:

```sh
# sign it yourselves: a signing page over the real PDF, with a sealed audit trail
pnpm exec latex-kit-sign send project/out/agreement-sample/agreement-sample.pdf \
  --signer 'provider=Sam Sample <sam@example.test>' \
  --signer 'client=Pat Placeholder <pat@example.test>'
pnpm exec latex-kit-sign serve

# or sign through another app: a copy with numbered yellow boxes showing where each field goes
pnpm guide
```

`send` prints a private link and a 6-digit code for each signer. It emails nobody: you send them. Envelopes are kept in `.latex-kit-sign/`, which is ignored by git because it holds signers' details. See [`@latex-kit/sign`](https://www.npmjs.com/package/@latex-kit/sign) for what is recorded and what it does not do.

### Add a template package

```sh
cd packages
pgpm init --repo constructive-io/latex-kit-boilerplates --template module
```

## Contributing a template

- Write the wording yourself. **Do not paste in a form you got from a law firm, a client, an employer or another company**: it is probably not yours to license, and it may show terms someone meant to keep private.
- Sample records use invented people and companies only.

## Credits

**🛠 Built by the [Constructive](https://constructive.io) team — creators of modular Postgres tooling for secure, composable backends. If you like our work, contribute on [GitHub](https://github.com/constructive-io).**

## Disclaimer

**Not legal advice. No lawyer-client relationship. Have a lawyer review anything you use.** The full text is in [DISCLAIMER.md](DISCLAIMER.md).

AS DESCRIBED IN THE LICENSES, THE SOFTWARE AND TEMPLATES ARE PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software or these templates will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of them, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
