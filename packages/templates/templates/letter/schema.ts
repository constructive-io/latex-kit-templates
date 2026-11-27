import { ISODate, Organization, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'LTR', title: 'Letter' };

export default z.object({
  date: ISODate,
  from: Organization,
  to: Party,
  body: z.string(),
});
