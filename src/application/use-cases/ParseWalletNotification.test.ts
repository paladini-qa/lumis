import { parseWalletNotification } from './ParseWalletNotification';

describe('ParseWalletNotification Use Case (TDD - RED)', () => {
  it('should parse standard English spent notification with debit payment', () => {
    const text = 'R$ 29,90 paid at Starbucks';
    const result = parseWalletNotification(text);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(29.90);
    expect(result?.description).toBe('Starbucks');
    expect(result?.paymentMethodSuggested).toBe('debit');
  });

  it('should parse Portuguese credit card notification with Mastercard', () => {
    const text = 'Compra de R$ 120,50 no Pão de Açúcar com Mastercard';
    const result = parseWalletNotification(text);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(120.50);
    expect(result?.description).toBe('Pão de Açúcar');
    expect(result?.paymentMethodSuggested).toBe('credit');
  });

  it('should parse Portuguese credit card notification with Visa', () => {
    const text = 'Compra de R$ 15,00 em Uber com Visa';
    const result = parseWalletNotification(text);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(15.00);
    expect(result?.description).toBe('Uber');
    expect(result?.paymentMethodSuggested).toBe('credit');
  });

  it('should parse transaction with dots in thousands separator', () => {
    const text = 'R$ 1.450,25 paid at Apple Store';
    const result = parseWalletNotification(text);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(1450.25);
    expect(result?.description).toBe('Apple Store');
    expect(result?.paymentMethodSuggested).toBe('debit');
  });

  it('should parse transaction text with dot decimal separator', () => {
    const text = 'Transação de R$ 8.95 aprovada em Obsidian Cafe';
    const result = parseWalletNotification(text);
    
    expect(result).not.toBeNull();
    expect(result?.amount).toBe(8.95);
    expect(result?.description).toBe('Obsidian Cafe');
    expect(result?.paymentMethodSuggested).toBe('debit');
  });

  it('should return null for non-transaction notification texts', () => {
    const text = 'Your Google Wallet is ready for payments';
    const result = parseWalletNotification(text);
    expect(result).toBeNull();
  });
});
