---
name: latex-kit-reproducible-builds
description: Make latex-kit builds repeatable and run them in CI — pin the TeX image, prove a PDF is byte-identical, pick the engine, fix Docker and font problems, and build documents on every push. Use when asked to "build the PDFs in CI", "add a GitHub Action for the documents", "why did the PDF change", "pin the TeX version", "make the build reproducible", "latex-kit doctor", "it works without Docker?", "Docker is slow on my Mac", "the Japanese text is missing", or when a build fails before TeX prints anything useful.
compatibility: Node 22+; Docker (or a local TeX Live with --local, not pinned); latex-kit 0.6+
metadata:
  author: constructive-io
  version: "0.1.0"
---

# Builds that give the same PDF every time

The same commit always produces the same PDF bytes. Two things make that true: the TeX image is pinned by digest, and the build date comes from git.

```sh
latex-kit doctor                  # is Docker running, is the image pulled, does it run natively
latex-kit lock                    # pin the TeX and pandoc images in latex-kit.lock; commit it
latex-kit lock --check            # fail when the lock is missing or stale
latex-kit build --final --verify  # build twice; fail unless the PDFs are byte-identical
```

## The boilerplate already does this

The `workspace` starter in [constructive-io/latex-kit-boilerplates](https://github.com/constructive-io/latex-kit-boilerplates) comes with a lock file and a CI workflow that checks, regenerates schemas, and builds every template and document:

```sh
npx latex-kit init my-templates --template workspace --fullName "Ada Marsh" --email ada@example.test --username my-scope --no-tty
```

Copy its `.github/workflows/ci.yml` rather than writing one from nothing.

## CI for a project

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0        # commit dates set each PDF's build date
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: pnpm install
- run: pnpm exec latex-kit check          # no TeX; fails fast
- run: pnpm exec latex-kit lock --check
- run: pnpm exec latex-kit build --variant blank
- run: pnpm exec latex-kit build --strict  # drafts; --strict fails on a missing value
```

- **`fetch-depth: 0`** matters. With a shallow clone every file's last commit is the same one and build dates change.
- **Build drafts in CI, not finals.** A final build mints a document ID and writes it into the record; that belongs in a commit someone makes on purpose.
- **Upload PDFs as artifacts; never commit them.**
- `CI=true` already makes a missing value an error in drafts.

## CI for a plain .tex file

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: constructive-io/latex-kit/action@v1
  with:
    file: paper/main.tex
    engine: auto
    verify: 'true'
```

Outputs `pdf` and `sha256`, and uploads the PDF as an artifact. The `latex-kit-papers` skill covers papers.

## When a PDF changed and nothing should have

| Cause | Check |
|---|---|
| The image moved | `git log -p latex-kit.lock`. Only `latex-kit lock` changes it; a newer latex-kit never does |
| The build date moved | A commit touched the template, a clause, a snippet or the record. `SOURCE_DATE_EPOCH` overrides the date |
| The engine is XeLaTeX | Never byte-identical: it gives embedded fonts random names. Compare by eye, or move to LuaLaTeX |
| `--local` was used | A TeX on the machine is not pinned. Use it to iterate, not to produce the copy you send |
| A stale PDF was reused | A build whose inputs all match the last one reuses its PDF. `--force` rebuilds |

Each build writes a manifest in `out/<document>/` with a hash of every input, the image and the engine. Two manifests tell you which input differed.

## Engines

Chosen per document unless `--engine` or the config sets one:

| The file has | Engine |
|---|---|
| a `% !TEX program = …` line | that one |
| PSTricks packages | `pdfps` (latex, dvips, ps2pdf) |
| `xeCJK` or `ctex` | `xelatex` |
| `CJK` or `CJKutf8` | `pdflatex` |
| anything else | `lualatex` |

Chinese, Japanese or Korean text with no CJK package gets a warning and prints as missing glyphs. For Japanese under LuaLaTeX use `luatexja` with the IPAex fonts, which are in the image; [examples/workspace/templates/letter-ja](https://github.com/constructive-io/latex-kit/tree/main/examples/workspace/templates/letter-ja) is a working letter.

## When it will not build

1. `latex-kit doctor`. It exits 1 and says why when rendering cannot work.
2. Docker is not running, or the image is not pulled: the first build pulls it once, and that takes a while.
3. On an Apple Silicon Mac the image runs natively. If doctor says it does not, something set `--platform` or `platform:` in the config; remove it.
4. `latex-kit check` passes but TeX fails: the error is in the LaTeX, not the data. Build with `--tex-only` and read `out/<document>/<document>.tex` at the line TeX names.
5. A package is missing from the image: use `--image` with one that has it, then `latex-kit lock`.

## Related skills

- `latex-kit`: the project being built.
- `latex-kit-papers`: plain `.tex` documents.
- `latex-kit-review`: what to look at once it builds.
