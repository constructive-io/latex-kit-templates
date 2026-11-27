import { defineComponent, money, percent, table, tex } from 'latex-kit';

import type { InvoiceData } from '../templates/invoice/types';

export default defineComponent<InvoiceData | undefined>((data, ctx) => {
  const footer = [
    ['', '', 'Subtotal', money(ctx, data?.subtotal, 'USD')],
    ...(data && data.taxRate > 0 ? [['', '', `Tax (${percent(ctx, data.taxRate)})`, money(ctx, data.tax, 'USD')]] : []),
    ['', '', tex`\\textbf{Total}`, tex`\\textbf{${money(ctx, data?.total, 'USD')}}`],
  ];
  return table(
    data?.items,
    [
      { header: 'Description', value: 'description', align: 'X' },
      { header: 'Qty', value: 'quantity', format: 'number', align: 'r' },
      { header: 'Unit price', value: 'unitPrice', format: 'money:USD', align: 'r' },
      { header: 'Amount', value: 'amount', format: 'money:USD', align: 'r' },
    ],
    ctx,
    { footer }
  );
});
