---
name: latex-kit-sign
description: Get a PDF signed with @latex-kit/sign — a signing page over the real PDF with a sealed audit trail, or a placement guide for another signing app. Use when asked to "get this PDF signed", "send this for signature", "set up e-signing", "where do the signature fields go", "place the fields in DocuSign", "place the fields in Dropbox Sign", "add signature boxes to this PDF", "who has signed", "verify this signed document", or when an agent is about to drag signature fields onto a PDF by eye.
compatibility: Node 22+; @latex-kit/sign 0.6+; a PDF, and either latex-kit 0.6+ to mark where it is signed or a browser to draw the boxes
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Getting a PDF signed

Everything works from two files: the PDF, and a `.form.json` beside it that says where its boxes are.

```
agreement.pdf          the document
agreement.form.json    [{ type, who, page, x, y, width, height }, …]   PDF points, from the bottom-left of the page
```

`type` is `signature`, `date`, `initials` or `text`. `who` is the party that fills it in.

## Try it on the boilerplate first

The `project` starter in [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates) has an agreement with two signature blocks and `@latex-kit/sign` already installed:

```sh
npx latex-kit init signing-demo --template project --fullName "Ada Marsh" --no-tty
cd signing-demo && pnpm install && pnpm final
pnpm exec latex-kit-sign send out/agreement-sample/agreement-sample.pdf \
  --signer 'provider=Sam Sample <sam@example.test>' --signer 'client=Pat Placeholder <pat@example.test>'
pnpm exec latex-kit-sign serve      # open the two printed links
pnpm guide                          # and the yellow-box guide for another signing app
```

## Where the second file comes from

| You have | Do this |
|---|---|
| A latex-kit document | `latex-kit build --final`. `\signature{party}` blocks mark their own signature and date lines; `\formfield[type=signature,who=witness,width=6cm]{}` marks any other spot. The build writes the file |
| Any other PDF | `latex-kit-sign place file.pdf`, then draw the boxes in the browser and save |

If a latex-kit build wrote no `.form.json`, the template marks no spots: add `\signature` or `\formfield[type=…,who=…]`. Do not write coordinates by hand.

## Route 1: sign with this package

```sh
latex-kit-sign send out/acme/acme.pdf \
  --signer 'provider=Sam Sample <sam@example.test>' \
  --signer 'client=Pat Placeholder <pat@example.test>'
latex-kit-sign serve
```

- `who` before the `=` must match a `who` in the `.form.json`. `send` says which names the file uses if one is missing.
- `send` prints a private link and a 6-digit access code for each signer, **once**. They are stored only as hashes.
- **It emails nobody, and neither do you** unless the person you work for asked for exactly that. Hand them the links and codes; they go to each signer by different routes.
- `--ordered` makes each signer wait for the one before. `--days <n>` sets how long links work (default 14).

The signer enters the code, sees the real PDF with a box on each of their spots, draws or types a signature, fills any text boxes, and agrees to the signing terms in a popover. Their browser asks to share location; a refusal is recorded and does not stop them.

| Afterwards | |
|---|---|
| `latex-kit-sign list` | Every envelope and where it stands |
| `latex-kit-sign status <envelope>` | Who signed, from where, and the event log |
| `latex-kit-sign reissue <envelope> <who>` | A fresh link and code for someone locked out, expired, or who lost theirs |
| `latex-kit-sign verify <envelope> [signed.pdf]` | The file is the one that was signed and its record is intact |

When everyone has signed, a certificate page is added and the result is sealed. The signed file is `<data>/<envelope>/current.pdf`; the untouched original sits beside it.

Envelopes live in `.latex-kit-sign/` (or `LATEX_KIT_SIGN_DATA`). They hold signers' names, emails, IP addresses and locations: **never commit that folder**, and back up its `seal-key.pem`.

## Route 2: sign with another app

```sh
latex-kit-sign guide out/acme/acme.pdf        # or: --all out
```

This writes `acme.guide.pdf`: the same pages with a numbered yellow box on every spot, and a last page listing each box's page, signer and position from the **top-left** corner, as a percentage of the page and in inches. `acme.guide.json` holds the same list.

When placing fields in DocuSign, Dropbox Sign or similar:

1. Upload the **plain** PDF, never the guide copy.
2. Open the guide's last page. Add one field per row, on the page it names, for the signer it names.
3. Put each field where its yellow box is. Use the percentages when the app or your screen gives you coordinates; they hold at any zoom.
4. Compare the app's preview against the yellow boxes before sending.

Do not estimate positions from the plain PDF: that is how fields end up on the wrong line.

## What it does not do

- It does not send email or texts, and has no login. The access code is only as strong as the way it reaches the signer.
- Its seal is its own, checked with `verify`. A PDF reader will not show the file as digitally signed.
- Typed text is limited to Latin letters.
- It has no HTTPS of its own. Put it behind a proxy that provides it before anyone outside the machine signs; browsers only offer location on HTTPS or localhost.
- It is not legal advice. Whether a signature made this way is acceptable for a given document is for the person responsible to decide.

## Related skills

- `latex-kit`: write the templates and records the PDFs are built from.
