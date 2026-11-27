import { ISODate, Organization, z } from 'latex-kit';

export const meta = { docIdPrefix: 'INV', title: 'Invoice' };

export const LineItem = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  /** quantity × unitPrice, computed in the record */
  amount: z.number().nonnegative(),
});

export default z.object({
  from: Organization,
  to: Organization,
  issued: ISODate,
  due: ISODate,
  items: z.array(LineItem).min(1),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(1),
  tax: z.number(),
  total: z.number(),
  notes: z.string().optional(),
});
