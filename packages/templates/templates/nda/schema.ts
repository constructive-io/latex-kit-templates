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
  /** Extra carve-outs, printed as a list when present. */
  exclusions: z.array(z.string()).default([]),
  /** Attached after the signatures, one page each: Exhibit A, B, … */
  exhibits: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
});
