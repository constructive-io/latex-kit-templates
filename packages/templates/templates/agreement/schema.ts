import { ISODate, Money, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'AGR', title: 'Services agreement' };

export default z.object({
  effectiveDate: ISODate,
  /** Who does the work. An organization has a `signer`; a person signs for themselves. */
  provider: Party,
  client: Party,
  /** One or more paragraphs. A blank line starts a new paragraph. */
  services: z.string(),
  fee: Money,
  paymentDays: z.number().int().positive().default(30),
  termMonths: z.number().int().positive(),
  /** Leave out for an agreement that cannot be ended early. */
  noticeDays: z.number().int().positive().optional(),
  governingLaw: z.string(),
});
