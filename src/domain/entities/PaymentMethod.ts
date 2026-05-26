export interface PaymentMethodInput {
  id?: string;
  userId: string;
  name: string;
  type: 'debit' | 'credit';
  closureDay?: number | null;
  dueDay?: number | null;
  icon?: string | null;
  color: string;
}

export class PaymentMethod implements PaymentMethodInput {
  id?: string;
  userId: string;
  name: string;
  type: 'debit' | 'credit';
  closureDay?: number | null;
  dueDay?: number | null;
  icon?: string | null;
  color: string;

  constructor(data: PaymentMethodInput) {
    validatePaymentMethod(data);
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.type = data.type;
    this.closureDay = data.closureDay;
    this.dueDay = data.dueDay;
    this.icon = data.icon;
    this.color = data.color;
  }
}

export function validatePaymentMethod(data: Partial<PaymentMethodInput>): void {
  if (!data.userId || data.userId.trim() === '') {
    throw new Error('User ID is required');
  }

  if (!data.name || data.name.trim() === '') {
    throw new Error('Payment method name is required');
  }

  const validTypes = ['debit', 'credit'];
  if (!data.type || !validTypes.includes(data.type)) {
    throw new Error('Invalid payment method type');
  }

  if (data.type === 'credit') {
    if (data.closureDay === undefined || data.closureDay === null || data.closureDay < 1 || data.closureDay > 31) {
      throw new Error('Credit card closure day must be between 1 and 31');
    }
    if (data.dueDay === undefined || data.dueDay === null || data.dueDay < 1 || data.dueDay > 31) {
      throw new Error('Credit card due day must be between 1 and 31');
    }
  }

  if (!data.color || data.color.trim() === '') {
    throw new Error('Color is required');
  }
}
