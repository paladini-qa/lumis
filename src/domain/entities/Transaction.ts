export interface TransactionInput {
  userId: string;
  paymentMethodId: string;
  categoryId?: string | null;
  goalId?: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: Date;
  description: string;
  paymentStatus: 'paid' | 'pending';
  statementMonth: Date;
  notes?: string | null;
  isRecurring?: boolean;
  installmentId?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
}

export class Transaction implements TransactionInput {
  userId: string;
  paymentMethodId: string;
  categoryId?: string | null;
  goalId?: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: Date;
  description: string;
  paymentStatus: 'paid' | 'pending';
  statementMonth: Date;
  notes?: string | null;
  isRecurring?: boolean;
  installmentId?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;

  constructor(data: TransactionInput) {
    validateTransaction(data);
    this.userId = data.userId;
    this.paymentMethodId = data.paymentMethodId;
    this.categoryId = data.categoryId;
    this.goalId = data.goalId;
    this.amount = data.amount;
    this.type = data.type;
    this.date = data.date;
    this.description = data.description;
    this.paymentStatus = data.paymentStatus;
    this.statementMonth = data.statementMonth;
    this.notes = data.notes;
    this.isRecurring = data.isRecurring;
    this.installmentId = data.installmentId;
    this.installmentNumber = data.installmentNumber;
    this.totalInstallments = data.totalInstallments;
  }
}

export function validateTransaction(data: Partial<TransactionInput>): void {
  if (!data.userId || data.userId.trim() === '') {
    throw new Error('User ID is required');
  }
  
  if (!data.paymentMethodId || data.paymentMethodId.trim() === '') {
    throw new Error('Payment method ID is required');
  }

  if (data.amount === undefined || data.amount === null || data.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const validTypes = ['income', 'expense', 'transfer'];
  if (!data.type || !validTypes.includes(data.type)) {
    throw new Error('Invalid transaction type');
  }

  if (!data.description || data.description.trim() === '') {
    throw new Error('Description cannot be empty');
  }

  const validStatuses = ['paid', 'pending'];
  if (!data.paymentStatus || !validStatuses.includes(data.paymentStatus)) {
    throw new Error('Invalid payment status');
  }

  if (!data.date || isNaN(data.date.getTime())) {
    throw new Error('Invalid date');
  }

  if (!data.statementMonth || isNaN(data.statementMonth.getTime())) {
    throw new Error('Invalid statement month');
  }
}
