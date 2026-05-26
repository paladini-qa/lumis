import { calculateStatementMonth } from './CalculateStatementMonth';

describe('CalculateStatementMonth Use Case (TDD - RED)', () => {
  // Test Case 1: Debit/Cash Transaction
  it('should return the transaction date as statement month for DEBIT payment methods', () => {
    const transactionDate = new Date('2026-05-26');
    const paymentMethodType = 'debit';
    const result = calculateStatementMonth(transactionDate, paymentMethodType);
    expect(result.toISOString().slice(0, 10)).toBe('2026-05-01');
  });

  // Test Case 2: Credit Card before closure day
  it('should return the SAME month for CREDIT payment methods when day is BEFORE the closure day', () => {
    const transactionDate = new Date('2026-05-05'); // 5th of May
    const paymentMethodType = 'credit';
    const closureDay = 10;
    const result = calculateStatementMonth(transactionDate, paymentMethodType, closureDay);
    expect(result.toISOString().slice(0, 10)).toBe('2026-05-01');
  });

  // Test Case 3: Credit Card on/after closure day
  it('should return the NEXT month for CREDIT payment methods when day is ON or AFTER the closure day', () => {
    const transactionDate = new Date('2026-05-10'); // 10th of May
    const paymentMethodType = 'credit';
    const closureDay = 10;
    const result = calculateStatementMonth(transactionDate, paymentMethodType, closureDay);
    expect(result.toISOString().slice(0, 10)).toBe('2026-06-01');
  });

  // Test Case 4: Year Rollover (December to January next year)
  it('should handle year rollover when CREDIT payment method closure triggers next month in December', () => {
    const transactionDate = new Date('2026-12-15'); // 15th of December
    const paymentMethodType = 'credit';
    const closureDay = 10;
    const result = calculateStatementMonth(transactionDate, paymentMethodType, closureDay);
    expect(result.toISOString().slice(0, 10)).toBe('2027-01-01');
  });
});
