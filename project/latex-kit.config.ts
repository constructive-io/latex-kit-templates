import { defineConfig } from 'latex-kit';
const pkg = 'node_modules/@latex-kit/templates';

export default defineConfig({
  templates: `${pkg}/templates`,
  snippets: `${pkg}/snippets`,
  clauses: `${pkg}/clauses`,
  components: `${pkg}/components`,
  blanks: 'lines',
  watermark: false,
});
