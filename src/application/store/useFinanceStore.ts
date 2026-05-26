import { create } from 'zustand';
import { Transaction } from '../../domain/entities/Transaction';
import { PaymentMethod } from '../../domain/entities/PaymentMethod';
import { calculateStatementMonth } from '../use-cases/CalculateStatementMonth';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string | null;
}

export interface WalletDraft {
  id: string;
  amount: number;
  date: Date;
  description: string;
  paymentMethodSuggested: 'debit' | 'credit';
  notes?: string | null;
  createdAt: Date;
}

interface AddTransactionInput {
  userId: string;
  paymentMethodId: string;
  categoryId?: string | null;
  goalId?: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: Date;
  description: string;
  paymentStatus: 'paid' | 'pending';
  notes?: string | null;
  isRecurring?: boolean;
  installmentId?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
}

interface FinanceState {
  primaryBalance: number;
  isPrivate: boolean;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  categories: Category[];
  enableWalletInterceptor: boolean;
  walletDrafts: WalletDraft[];
  togglePrivacy: () => void;
  setPrimaryBalance: (balance: number) => void;
  addTransaction: (input: AddTransactionInput) => void;
  setEnableWalletInterceptor: (enabled: boolean) => void;
  addWalletDraft: (input: Omit<WalletDraft, 'id' | 'createdAt'>) => void;
  removeWalletDraft: (id: string) => void;
  clearWalletDrafts: () => void;
  reset: () => void;
}

const INITIAL_BALANCE = 18450.72;

const getMockPaymentMethods = (): PaymentMethod[] => {
  return [
    new PaymentMethod({
      id: 'pay-debit',
      userId: 'user-1',
      name: 'Liquid Cash',
      type: 'debit',
      color: '#B9D4A3', // Positive green
      icon: 'cash-outline',
    }),
    new PaymentMethod({
      id: 'pay-credit-visa',
      userId: 'user-1',
      name: 'Visa Gold',
      type: 'credit',
      closureDay: 10,
      dueDay: 20,
      color: '#E6C687', // Gold
      icon: 'card-outline',
    }),
    new PaymentMethod({
      id: 'pay-credit-master',
      userId: 'user-1',
      name: 'Master Reserve',
      type: 'credit',
      closureDay: 15,
      dueDay: 25,
      color: '#1C1F24', // Obsidian surface overlay
      icon: 'card-outline',
    }),
  ];
};

const getMockCategories = (): Category[] => {
  return [
    { id: 'cat-groceries', userId: 'user-1', name: 'Groceries', color: '#B9D4A3', icon: 'cart-outline' },
    { id: 'cat-transport', userId: 'user-1', name: 'Transport', color: '#C9A961', icon: 'car-outline' },
    { id: 'cat-utilities', userId: 'user-1', name: 'Utilities', color: '#E09B87', icon: 'home-outline' },
    { id: 'cat-salary', userId: 'user-1', name: 'Salary', color: '#F5EFE0', icon: 'briefcase-outline' },
    { id: 'cat-leisure', userId: 'user-1', name: 'Leisure', color: '#F3D99A', icon: 'wine-outline' },
  ];
};

const getMockTransactions = (): Transaction[] => {
  return [
    new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-debit',
      categoryId: 'cat-salary',
      amount: 20000.00,
      type: 'income',
      date: new Date('2026-05-01'),
      description: 'Monthly Salary Payment',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
      notes: 'Corporate direct deposit',
    }),
    new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-credit-visa',
      categoryId: 'cat-leisure',
      amount: 350.00,
      type: 'expense',
      date: new Date('2026-05-10'),
      description: 'Elite Gym Membership',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
    }),
    new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-debit',
      categoryId: 'cat-groceries',
      amount: 48.50,
      type: 'expense',
      date: new Date('2026-05-15'),
      description: 'Obsidian Cafe',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
    }),
    new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-credit-master',
      categoryId: 'cat-leisure',
      amount: 1150.78,
      type: 'expense',
      date: new Date('2026-05-20'),
      description: 'Reserve Wine Shop',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
      notes: 'Premium collection',
    }),
  ];
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  primaryBalance: INITIAL_BALANCE,
  isPrivate: false,
  transactions: getMockTransactions(),
  paymentMethods: getMockPaymentMethods(),
  categories: getMockCategories(),
  enableWalletInterceptor: false,
  walletDrafts: [],
  
  togglePrivacy: () => set((state) => ({ isPrivate: !state.isPrivate })),
  
  setPrimaryBalance: (balance: number) => set({ primaryBalance: balance }),
  
  addTransaction: (input: AddTransactionInput) => set((state) => {
    // Find payment method to calculate statement month automatically
    const paymentMethod = state.paymentMethods.find((p) => p.id === input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error(`Payment method with ID ${input.paymentMethodId} not found`);
    }

    const calculatedStatementMonth = calculateStatementMonth(
      input.date,
      paymentMethod.type,
      paymentMethod.closureDay ?? undefined
    );

    const transaction = new Transaction({
      ...input,
      statementMonth: calculatedStatementMonth,
    });

    let balanceChange = 0;
    if (transaction.type === 'income') {
      balanceChange = transaction.amount;
    } else if (transaction.type === 'expense') {
      balanceChange = -transaction.amount;
    } else if (transaction.type === 'transfer') {
      balanceChange = -transaction.amount;
    }
    
    return {
      transactions: [...state.transactions, transaction],
      primaryBalance: state.primaryBalance + balanceChange,
    };
  }),

  setEnableWalletInterceptor: (enabled: boolean) => set({ enableWalletInterceptor: enabled }),

  addWalletDraft: (input) => set((state) => {
    const draft: WalletDraft = {
      ...input,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
    };
    return { walletDrafts: [...state.walletDrafts, draft] };
  }),

  removeWalletDraft: (id) => set((state) => ({
    walletDrafts: state.walletDrafts.filter((d) => d.id !== id),
  })),

  clearWalletDrafts: () => set({ walletDrafts: [] }),

  reset: () => set({
    primaryBalance: INITIAL_BALANCE,
    isPrivate: false,
    transactions: getMockTransactions(),
    paymentMethods: getMockPaymentMethods(),
    categories: getMockCategories(),
    enableWalletInterceptor: false,
    walletDrafts: [],
  }),
}));

if (typeof window !== 'undefined') {
  (window as any).useFinanceStore = useFinanceStore;
}
