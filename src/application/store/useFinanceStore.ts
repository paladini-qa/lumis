import { create } from 'zustand';
import { Transaction } from '../../domain/entities/Transaction';

interface FinanceState {
  primaryBalance: number;
  isPrivate: boolean;
  transactions: Transaction[];
  togglePrivacy: () => void;
  setPrimaryBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  reset: () => void;
}

const INITIAL_BALANCE = 18450.72;

const getMockTransactions = (): Transaction[] => {
  return [
    new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-debit',
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

export const useFinanceStore = create<FinanceState>((set) => ({
  primaryBalance: INITIAL_BALANCE,
  isPrivate: false,
  transactions: getMockTransactions(),
  
  togglePrivacy: () => set((state) => ({ isPrivate: !state.isPrivate })),
  
  setPrimaryBalance: (balance: number) => set({ primaryBalance: balance }),
  
  addTransaction: (transaction: Transaction) => set((state) => {
    let balanceChange = 0;
    if (transaction.type === 'income') {
      balanceChange = transaction.amount;
    } else if (transaction.type === 'expense') {
      balanceChange = -transaction.amount;
    } else if (transaction.type === 'transfer') {
      // Per specs, transferring/contributing to a savings goal reduces the primary balance
      balanceChange = -transaction.amount;
    }
    
    return {
      transactions: [...state.transactions, transaction],
      primaryBalance: state.primaryBalance + balanceChange,
    };
  }),

  reset: () => set({
    primaryBalance: INITIAL_BALANCE,
    isPrivate: false,
    transactions: getMockTransactions(),
  }),
}));
