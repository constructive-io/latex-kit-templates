import { ISODate, Money, Party, z } from 'latex-kit';

export const meta = { docIdPrefix: 'AGR', title: 'Services agreement' };

export default z.object({
  effectiveDate: ISODate,
  provider: Party,
  client: Party,
  services: z.string(),
  fee: Money,
  paymentDays: z.number().int().positive().default(30),
  termMonths: z.number().int().positive(),
  noticeDays: z.number().int().positive().optional(),
  governingLaw: z.string(),
});
