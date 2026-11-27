import { ISODate, Organization, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'LTR', title: 'Letter' };

export default z.object({
  date: ISODate,
  from: Organization,
  to: Party,
  /** One or more paragraphs. A blank line starts a new paragraph. */
  body: z.string(),
});
