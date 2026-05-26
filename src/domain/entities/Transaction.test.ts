import { Transaction, validateTransaction } from './Transaction';

describe('Transaction Entity Validation (TDD - RED)', () => {
  const validData = {
    userId: 'user-123',
    paymentMethodId: 'pay-456',
    categoryId: 'cat-789',
    amount: 150.50,
    type: 'expense' as const,
    date: new Date('2026-05-26'),
    description: 'Groceries at Supermarket',
    paymentStatus: 'paid' as const,
    statementMonth: new Date('2026-05-01'),
  };

  it('should validate a correct transaction without errors', () => {
    expect(() => validateTransaction(validData)).not.toThrow();
  });

  it('should throw an error if amount is zero or negative', () => {
    const invalidDataZero = { ...validData, amount: 0 };
    const invalidDataNegative = { ...validData, amount: -10 };
    expect(() => validateTransaction(invalidDataZero)).toThrow('Amount must be greater than 0');
    expect(() => validateTransaction(invalidDataNegative)).toThrow('Amount must be greater than 0');
  });

  it('should throw an error if type is invalid', () => {
    const invalidData = { ...validData, type: 'refund' as any };
    expect(() => validateTransaction(invalidData)).toThrow('Invalid transaction type');
  });

  it('should throw an error if description is empty or only whitespace', () => {
    const invalidDataEmpty = { ...validData, description: '' };
    const invalidDataWhitespace = { ...validData, description: '   ' };
    expect(() => validateTransaction(invalidDataEmpty)).toThrow('Description cannot be empty');
    expect(() => validateTransaction(invalidDataWhitespace)).toThrow('Description cannot be empty');
  });

  it('should throw an error if paymentStatus is invalid', () => {
    const invalidData = { ...validData, paymentStatus: 'draft' as any };
    expect(() => validateTransaction(invalidData)).toThrow('Invalid payment status');
  });
});
