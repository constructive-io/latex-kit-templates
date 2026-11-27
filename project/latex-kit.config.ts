import { defineConfig } from 'latex-kit';

// Templates come from the package, the same way a project outside this
// workspace would use a published version of it.
const pkg = 'node_modules/@latex-kit/templates';

export default defineConfig({
  templates: `${pkg}/templates`,
  snippets: `${pkg}/snippets`,
  clauses: `${pkg}/clauses`,
  components: `${pkg}/components`,
  // a blank form is one a person writes on: empty lines, not labelled ones
  blanks: 'lines',
});
