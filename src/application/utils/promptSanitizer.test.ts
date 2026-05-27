import { sanitizePromptContext, maskPII } from './promptSanitizer';

describe('promptSanitizer', () => {
  describe('maskPII', () => {
    it('should mask email addresses', () => {
      const input = 'My email is user.name+tag@example.com, please contact me.';
      const expected = 'My email is [EMAIL_MASKED], please contact me.';
      expect(maskPII(input)).toBe(expected);
    });

    it('should mask phone numbers', () => {
      const inputs = [
        'Call me at +55 11 99999-9999 today.',
        'My phone number is (11) 98765-4321.',
        'Contact: 98765-4321.',
      ];
      expect(maskPII(inputs[0])).toContain('[PHONE_MASKED]');
      expect(maskPII(inputs[1])).toContain('[PHONE_MASKED]');
      expect(maskPII(inputs[2])).toContain('[PHONE_MASKED]');
    });

    it('should mask CPF and CNPJ tax IDs', () => {
      const cpf = 'My CPF is 123.456.789-00.';
      const cnpj = 'CNPJ: 12.345.678/0001-99';
      expect(maskPII(cpf)).toContain('[TAX_ID_MASKED]');
      expect(maskPII(cnpj)).toContain('[TAX_ID_MASKED]');
    });

    it('should mask credit card patterns', () => {
      const card = 'Card number: 1234-5678-9012-3456.';
      expect(maskPII(card)).toContain('[CARD_MASKED]');
    });
  });

  describe('sanitizePromptContext', () => {
    it('should sanitize lists of transactions, payment methods, and categories by replacing sensitive IDs', () => {
      const mockPaymentMethods = [
        { id: 'uuid-pm-1', userId: 'user-123', name: 'Visa Gold', type: 'credit' },
        { id: 'uuid-pm-2', userId: 'user-123', name: 'Cash', type: 'debit' }
      ];

      const mockCategories = [
        { id: 'uuid-cat-1', userId: 'user-123', name: 'Groceries', color: '#123' },
        { id: 'uuid-cat-2', userId: 'user-123', name: 'Leisure', color: '#456' }
      ];

      const mockTransactions = [
        {
          id: 'uuid-tx-1',
          userId: 'user-123',
          paymentMethodId: 'uuid-pm-1',
          categoryId: 'uuid-cat-1',
          amount: 150.50,
          type: 'expense',
          date: new Date('2026-05-20'),
          description: 'Supermarket purchase by user@example.com',
          notes: 'Phone +5511999999999'
        }
      ];

      const result = sanitizePromptContext({
        transactions: mockTransactions,
        paymentMethods: mockPaymentMethods,
        categories: mockCategories
      });

      // IDs should be sanitized to anonymous mappings
      expect(result).not.toContain('uuid-pm-1');
      expect(result).not.toContain('uuid-pm-2');
      expect(result).not.toContain('uuid-cat-1');
      expect(result).not.toContain('uuid-cat-2');
      expect(result).not.toContain('uuid-tx-1');
      expect(result).not.toContain('user-123');

      // Names, types, and amounts should remain readable
      expect(result).toContain('Visa Gold');
      expect(result).toContain('Cash');
      expect(result).toContain('Groceries');
      expect(result).toContain('Leisure');
      expect(result).toContain('150.5');

      // PII inside descriptions and notes should be masked
      expect(result).toContain('[EMAIL_MASKED]');
      expect(result).toContain('[PHONE_MASKED]');
      expect(result).not.toContain('user@example.com');
      expect(result).not.toContain('+5511999999999');
    });
  });
});
