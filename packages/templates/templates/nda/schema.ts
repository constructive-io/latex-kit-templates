import { ISODate, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'NDA', title: 'Mutual or one-way NDA' };

export default z.object({
  effectiveDate: ISODate,
  discloser: Party,
  recipient: Party,
  mutual: z.boolean().default(true),
  termMonths: z.number().int().positive(),
  purpose: z.string(),
  governingLaw: z.string(),
  exclusions: z.array(z.string()).default([]),
  exhibits: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
});
