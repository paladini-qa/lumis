import { WalletDraft } from '../store/useFinanceStore';

export function parseWalletNotification(text: string): Omit<WalletDraft, 'id' | 'createdAt'> | null {
  if (!text) return null;

  // 1. Amount Extraction: matches "R$ 29,90" or "R$ 1.250,00" or "R$ 8.95"
  const amountRegex = /R\$\s*([0-9\.\,]+)/i;
  const amountMatch = text.match(amountRegex);
  if (!amountMatch) return null;

  let amountStr = amountMatch[1].trim();
  
  // Parse BRL currency format (e.g. 1.450,25 or 29,90 or 8.95)
  if (amountStr.includes(',') && amountStr.includes('.')) {
    amountStr = amountStr.replace(/\./g, '').replace(/,/g, '.');
  } else if (amountStr.includes(',')) {
    amountStr = amountStr.replace(/,/g, '.');
  }
  
  const amountValue = parseFloat(amountStr);
  if (isNaN(amountValue) || amountValue <= 0) return null;

  // 2. Merchant/Description Extraction:
  // Match after words like "at", "no", "na", "em", "aprovada em", "spent at", "paid at"
  // but stop before details like card names ("com Mastercard", "com Visa") or other sentence markers.
  const merchantRegex = /(?:aprovada em|spent at|paid at|no|na|em)\s+([^,\.\-\_]+?)(?:\s+com|\s+paid|\s+spent|\s+aprovada|\s*$)/i;
  const merchantMatch = text.match(merchantRegex);
  
  let description = 'Google Wallet Transaction';
  if (merchantMatch && merchantMatch[1]) {
    description = merchantMatch[1].trim();
  }

  // 3. Payment Method Suggested:
  // If text mentions card type names or credit labels, suggest "credit", otherwise default to "debit"
  const creditKeywords = ['mastercard', 'visa', 'credit', 'crédito', 'elo', 'card', 'cartão'];
  const lowercaseText = text.toLowerCase();
  const paymentMethodSuggested = creditKeywords.some((keyword) => lowercaseText.includes(keyword))
    ? 'credit'
    : 'debit';

  return {
    amount: amountValue,
    date: new Date(),
    description,
    paymentMethodSuggested,
    notes: 'Intercepted Google Wallet transaction',
  };
}
