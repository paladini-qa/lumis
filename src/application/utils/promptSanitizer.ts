/**
 * Mask Personally Identifiable Information (PII) such as emails, phone numbers, credit card numbers, and tax IDs.
 */
export function maskPII(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. Mask Email Addresses (including those with '+' symbol tags)
  const emailRegex = /[\w\-+.]+@[\w\-.]+\.[a-zA-Z]{2,}/g;
  sanitized = sanitized.replace(emailRegex, '[EMAIL_MASKED]');

  // 2. Mask Credit Card Numbers (13 to 16 digits, with optional spaces or dashes)
  const cardRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
  sanitized = sanitized.replace(cardRegex, '[CARD_MASKED]');

  // 3. Mask CPF and CNPJ (Brazilian Tax IDs)
  const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
  const cnpjRegex = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;
  sanitized = sanitized.replace(cpfRegex, '[TAX_ID_MASKED]')
                       .replace(cnpjRegex, '[TAX_ID_MASKED]');

  // 4. Mask Phone Numbers (standard international/local formats, and simple 8/9 digit local numbers)
  const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?\d{2,3}\)?[- ]?\d{4,5}[- ]?\d{4}\b|\b\d{4,5}[- ]?\d{4}\b/g;
  sanitized = sanitized.replace(phoneRegex, '[PHONE_MASKED]');

  return sanitized;
}

interface SanitizationInput {
  transactions: any[];
  paymentMethods: any[];
  categories: any[];
}

/**
 * Anonymizes raw IDs / UUIDs across entity relationships and masks PII in text fields
 * to produce a clean, secure context representation for Gemini.
 */
export function sanitizePromptContext({
  transactions,
  paymentMethods,
  categories
}: SanitizationInput): string {
  const idMap: { [originalId: string]: string } = {};
  
  let userIdCounter = 1;
  let pmCounter = 1;
  let catCounter = 1;
  let txCounter = 1;

  const getAnonId = (id: string | null | undefined, prefix: string): string => {
    if (!id) return '';
    if (idMap[id]) return idMap[id];
    
    let counter = 1;
    if (prefix === 'user') counter = userIdCounter++;
    else if (prefix === 'pm') counter = pmCounter++;
    else if (prefix === 'cat') counter = catCounter++;
    else if (prefix === 'tx') counter = txCounter++;
    
    const anonId = `${prefix}_${counter}`;
    idMap[id] = anonId;
    return anonId;
  };

  // Pre-map entities to establish consistent ID mappings
  const sanitizedPaymentMethods = paymentMethods.map(pm => {
    const anonId = getAnonId(pm.id, 'pm');
    const anonUserId = getAnonId(pm.userId, 'user');
    return {
      id: anonId,
      userId: anonUserId,
      name: maskPII(pm.name),
      type: pm.type,
      color: pm.color,
      icon: pm.icon
    };
  });

  const sanitizedCategories = categories.map(cat => {
    const anonId = getAnonId(cat.id, 'cat');
    const anonUserId = getAnonId(cat.userId, 'user');
    return {
      id: anonId,
      userId: anonUserId,
      name: maskPII(cat.name),
      color: cat.color,
      icon: cat.icon
    };
  });

  const sanitizedTransactions = transactions.map(tx => {
    const anonId = getAnonId(tx.id, 'tx');
    const anonUserId = getAnonId(tx.userId, 'user');
    const anonPmId = getAnonId(tx.paymentMethodId, 'pm');
    const anonCatId = getAnonId(tx.categoryId, 'cat');

    return {
      id: anonId,
      userId: anonUserId,
      paymentMethodId: anonPmId,
      categoryId: anonCatId,
      amount: tx.amount,
      type: tx.type,
      date: tx.date instanceof Date ? tx.date.toISOString().slice(0, 10) : String(tx.date).slice(0, 10),
      description: maskPII(tx.description),
      notes: tx.notes ? maskPII(tx.notes) : null
    };
  });

  // Construct Markdown representation
  let output = '### SECURE USER FINANCIAL CONTEXT\n\n';
  
  output += '#### Categories:\n';
  sanitizedCategories.forEach(cat => {
    output += `- ID: ${cat.id}, Name: "${cat.name}"\n`;
  });

  output += '\n#### Payment Methods:\n';
  sanitizedPaymentMethods.forEach(pm => {
    output += `- ID: ${pm.id}, Name: "${pm.name}", Type: ${pm.type}\n`;
  });

  output += '\n#### Recent Transactions:\n';
  sanitizedTransactions.forEach(tx => {
    output += `- ID: ${tx.id}, Date: ${tx.date}, Type: ${tx.type}, Amount: R$ ${tx.amount.toFixed(2)}, Description: "${tx.description}", CategoryRef: ${tx.categoryId || 'none'}, PaymentMethodRef: ${tx.paymentMethodId}\n`;
    if (tx.notes) {
      output += `  Notes: "${tx.notes}"\n`;
    }
  });

  return output;
}
