/**
 * Calculates the statement month for a transaction based on the payment method type and closure day.
 * 
 * - Cash/Debit: statement_month = transaction_date (same month/year, normalized to day 1).
 * - Credit Card:
 *   - If transaction_date.day >= card.closure_day, then statement_month = transaction_date.month + 1.
 *   - Else, statement_month = transaction_date.month.
 * 
 * Handles year rollover automatically. Uses UTC date operations to guarantee consistency across different environments.
 */
export function calculateStatementMonth(
  date: Date,
  paymentMethodType: 'debit' | 'credit',
  closureDay?: number
): Date {
  const statementDate = new Date(date.getTime());
  
  if (paymentMethodType === 'credit' && closureDay !== undefined) {
    const day = date.getUTCDate();
    if (day >= closureDay) {
      // Move to next month (JavaScript Date automatically handles year rollover)
      const currentMonth = statementDate.getUTCMonth();
      statementDate.setUTCMonth(currentMonth + 1);
    }
  }
  
  // Normalize date to 1st of the calculated month at 00:00:00 UTC
  statementDate.setUTCDate(1);
  statementDate.setUTCHours(0, 0, 0, 0);
  
  return statementDate;
}
