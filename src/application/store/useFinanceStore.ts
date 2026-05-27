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

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  deadline?: Date | null;
  color: string;
  icon?: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
}

export interface Friend {
  id: string;
  name: string;
  linkedUserId?: string | null;
  balance: number; // positive if they owe us, negative if we owe them
}

export interface Debt {
  id: string;
  userId: string;
  friendName: string;
  linkedUserId?: string | null;
  amount: number;
  description: string;
  date: Date;
  isSettled: boolean;
  createdAt: Date;
}

export interface AutoCategoryRule {
  id: string;
  substring: string;
  categoryId: string;
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
  tags?: string[]; // Custom tags
  splitWithFriend?: string | null; // Friend's name for 50/50 split
}

interface FinanceState {
  primaryBalance: number;
  isPrivate: boolean;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  categories: Category[];
  goals: Goal[];
  tags: Tag[];
  friendsList: Friend[];
  debts: Debt[];
  autoCategoryRules: AutoCategoryRule[];
  enableWalletInterceptor: boolean;
  walletDrafts: WalletDraft[];

  togglePrivacy: () => void;
  setPrimaryBalance: (balance: number) => void;
  addTransaction: (input: AddTransactionInput) => void;
  deleteTransaction: (id: string | undefined) => void;
  editTransactionException: (id: string, type: 'this' | 'future' | 'all', updatedFields: Partial<AddTransactionInput>) => void;
  
  // Payment Methods
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  
  // Categories & Tags
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addTag: (name: string) => void;
  addAutoCategoryRule: (substring: string, categoryId: string) => void;
  deleteAutoCategoryRule: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'currentSavings' | 'createdAt'>) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  // Google Wallet
  setEnableWalletInterceptor: (enabled: boolean) => void;
  addWalletDraft: (input: Omit<WalletDraft, 'id' | 'createdAt'>) => void;
  removeWalletDraft: (id: string) => void;
  clearWalletDrafts: () => void;

  // Shared Expenses / Splits
  addFriend: (name: string, linkedUserId?: string | null) => void;
  settleDebt: (debtId: string) => void;

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
      color: '#1C1F24', // Obsidian
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

const getMockGoals = (): Goal[] => {
  return [
    {
      id: 'goal-1',
      userId: 'user-1',
      name: 'Emergency Fund',
      targetAmount: 10000.00,
      currentSavings: 4500.00,
      deadline: new Date('2026-12-31'),
      color: '#E6C687', // Gold
      icon: 'shield-outline',
      createdAt: new Date(),
    },
    {
      id: 'goal-2',
      userId: 'user-1',
      name: 'Europe Trip',
      targetAmount: 25000.00,
      currentSavings: 8000.00,
      deadline: new Date('2027-06-30'),
      color: '#B9D4A3', // Positive green
      icon: 'airplane-outline',
      createdAt: new Date(),
    },
  ];
};

const getMockFriends = (): Friend[] => {
  return [
    { id: 'friend-1', name: 'Alice', balance: 50.00 },
    { id: 'friend-2', name: 'Bob', balance: -20.00 },
  ];
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  primaryBalance: INITIAL_BALANCE,
  isPrivate: false,
  transactions: getMockTransactions(),
  paymentMethods: getMockPaymentMethods(),
  categories: getMockCategories(),
  goals: getMockGoals(),
  tags: [
    { id: 'tag-1', userId: 'user-1', name: 'vacation2026' },
    { id: 'tag-2', userId: 'user-1', name: 'essential' },
  ],
  friendsList: getMockFriends(),
  debts: [],
  autoCategoryRules: [
    { id: 'rule-1', substring: 'uber', categoryId: 'cat-transport' },
    { id: 'rule-2', substring: 'market', categoryId: 'cat-groceries' },
  ],
  enableWalletInterceptor: false,
  walletDrafts: [],

  togglePrivacy: () => set((state) => ({ isPrivate: !state.isPrivate })),

  setPrimaryBalance: (balance: number) => set({ primaryBalance: balance }),

  addTransaction: (input: AddTransactionInput) => set((state) => {
    const paymentMethod = state.paymentMethods.find((p) => p.id === input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error(`Payment method with ID ${input.paymentMethodId} not found`);
    }

    // Apply auto-categorization substring rule if no category is provided
    let finalCategoryId = input.categoryId;
    if (!finalCategoryId && input.description) {
      const match = state.autoCategoryRules.find(
        (r) => input.description.toLowerCase().includes(r.substring.toLowerCase())
      );
      if (match) {
        finalCategoryId = match.categoryId;
      }
    }

    const calculatedStatementMonth = calculateStatementMonth(
      input.date,
      paymentMethod.type,
      paymentMethod.closureDay ?? undefined
    );

    // If it is an installment series
    const isInstallmentSeries = input.totalInstallments && input.totalInstallments > 1;
    const transactionsToAdd: Transaction[] = [];
    const installmentId = isInstallmentSeries ? (input.installmentId || Math.random().toString(36).substring(2, 11)) : null;

    let balanceChange = 0;

    if (isInstallmentSeries) {
      const N = input.totalInstallments!;
      const baseAmount = parseFloat((input.amount / N).toFixed(2));
      const firstAmount = parseFloat((input.amount - (baseAmount * (N - 1))).toFixed(2));

      for (let i = 1; i <= N; i++) {
        const installmentDate = new Date(input.date.getTime());
        installmentDate.setUTCMonth(installmentDate.getUTCMonth() + (i - 1));

        const instStatementMonth = calculateStatementMonth(
          installmentDate,
          paymentMethod.type,
          paymentMethod.closureDay ?? undefined
        );

        const currentInstAmount = i === 1 ? firstAmount : baseAmount;

        const transaction = new Transaction({
          ...input,
          categoryId: finalCategoryId,
          amount: currentInstAmount,
          date: installmentDate,
          statementMonth: instStatementMonth,
          installmentId,
          installmentNumber: i,
          totalInstallments: N,
        });

        transactionsToAdd.push(transaction);

        // Deduct expense immediately to match existing integration test expectations
        if (transaction.type === 'income') {
          balanceChange += transaction.amount;
        } else if (transaction.type === 'expense' || transaction.type === 'transfer') {
          balanceChange -= transaction.amount;
        }
      }
    } else {
      const transaction = new Transaction({
        ...input,
        categoryId: finalCategoryId,
        statementMonth: calculatedStatementMonth,
      });

      transactionsToAdd.push(transaction);

      if (transaction.type === 'income') {
        balanceChange += transaction.amount;
      } else if (transaction.type === 'expense' || transaction.type === 'transfer') {
        balanceChange -= transaction.amount;
      }
    }

    // Hybrid Splits logic
    let updatedFriends = [...state.friendsList];
    let updatedDebts = [...state.debts];

    if (input.splitWithFriend && input.type === 'expense') {
      const friendName = input.splitWithFriend;
      const splitAmount = parseFloat((input.amount / 2).toFixed(2));
      const debtId = Math.random().toString(36).substring(2, 11);

      const newDebt: Debt = {
        id: debtId,
        userId: input.userId,
        friendName,
        amount: splitAmount,
        description: `Split expense: ${input.description}`,
        date: input.date,
        isSettled: false,
        createdAt: new Date(),
      };

      updatedDebts.push(newDebt);

      // Adjust friend balance in our local tracking
      const friendIndex = updatedFriends.findIndex((f) => f.name.toLowerCase() === friendName.toLowerCase());
      if (friendIndex >= 0) {
        updatedFriends[friendIndex] = {
          ...updatedFriends[friendIndex],
          balance: updatedFriends[friendIndex].balance + splitAmount,
        };
      } else {
        updatedFriends.push({
          id: Math.random().toString(36).substring(2, 11),
          name: friendName,
          balance: splitAmount,
        });
      }
    }

    return {
      transactions: [...state.transactions, ...transactionsToAdd],
      primaryBalance: state.primaryBalance + balanceChange,
      friendsList: updatedFriends,
      debts: updatedDebts,
    };
  }),

  deleteTransaction: (id) => set((state) => {
    const transaction = state.transactions.find((t) => t.date.getTime() === (id as any) || t.description === id);
    if (!transaction) return {};

    let balanceRestore = 0;
    if (transaction.type === 'income') {
      balanceRestore = -transaction.amount;
    } else if (transaction.type === 'expense' || transaction.type === 'transfer') {
      balanceRestore = transaction.amount;
    }

    return {
      transactions: state.transactions.filter((t) => t !== transaction),
      primaryBalance: state.primaryBalance + balanceRestore,
    };
  }),

  editTransactionException: (id, type, updatedFields) => set((state) => {
    const index = state.transactions.findIndex((t) => t.installmentId === id || t.description === id);
    if (index < 0) return {};

    const updatedTransactions = [...state.transactions];
    const target = updatedTransactions[index];

    if (type === 'this') {
      // Modify this instance only: detach it or update its properties
      updatedTransactions[index] = new Transaction({
        ...target,
        ...updatedFields,
        date: updatedFields.date ? new Date(updatedFields.date) : target.date,
        statementMonth: target.statementMonth, // Keep or recalculate
      });
    } else if (type === 'all' || type === 'future') {
      // Modify all or future occurrences
      const targetInstallmentId = target.installmentId;
      updatedTransactions.forEach((t, i) => {
        if (targetInstallmentId && t.installmentId === targetInstallmentId) {
          if (type === 'all' || (type === 'future' && t.date >= target.date)) {
            updatedTransactions[i] = new Transaction({
              ...t,
              ...updatedFields,
              date: t.date, // keep original date
              statementMonth: t.statementMonth,
            });
          }
        }
      });
    }

    return { transactions: updatedTransactions };
  }),

  // Payment Methods
  addPaymentMethod: (pm) => set((state) => {
    const newPm = new PaymentMethod({
      ...pm,
      id: Math.random().toString(36).substring(2, 11),
    });
    return { paymentMethods: [...state.paymentMethods, newPm] };
  }),

  deletePaymentMethod: (id) => set((state) => ({
    paymentMethods: state.paymentMethods.filter((pm) => pm.id !== id),
  })),

  // Categories & Tags
  addCategory: (cat) => set((state) => {
    const newCat: Category = {
      ...cat,
      id: Math.random().toString(36).substring(2, 11),
    };
    return { categories: [...state.categories, newCat] };
  }),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((cat) => cat.id !== id),
  })),

  addTag: (name) => set((state) => {
    const newTag: Tag = {
      id: Math.random().toString(36).substring(2, 11),
      userId: 'user-1',
      name,
    };
    return { tags: [...state.tags, newTag] };
  }),

  addAutoCategoryRule: (substring, categoryId) => set((state) => {
    const newRule: AutoCategoryRule = {
      id: Math.random().toString(36).substring(2, 11),
      substring,
      categoryId,
    };
    return { autoCategoryRules: [...state.autoCategoryRules, newRule] };
  }),

  deleteAutoCategoryRule: (id) => set((state) => ({
    autoCategoryRules: state.autoCategoryRules.filter((r) => r.id !== id),
  })),

  // Goals
  addGoal: (goal) => set((state) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 11),
      currentSavings: 0,
      createdAt: new Date(),
    };
    return { goals: [...state.goals, newGoal] };
  }),

  contributeToGoal: (id, amount) => set((state) => {
    const updatedGoals = state.goals.map((g) => {
      if (g.id === id) {
        return { ...g, currentSavings: g.currentSavings + amount };
      }
      return g;
    });

    // Also deduct from primaryBalance and log a transfer transaction
    const transferPm = state.paymentMethods.find((pm) => pm.type === 'debit');
    const targetGoal = state.goals.find((g) => g.id === id);

    let nextTransactions = [...state.transactions];
    if (transferPm && targetGoal) {
      const calculatedStatementMonth = calculateStatementMonth(
        new Date(),
        transferPm.type,
        transferPm.closureDay ?? undefined
      );

      const goalTx = new Transaction({
        userId: 'user-1',
        paymentMethodId: transferPm.id!,
        goalId: id,
        amount,
        type: 'transfer',
        date: new Date(),
        description: `Contribution to ${targetGoal.name}`,
        paymentStatus: 'paid',
        statementMonth: calculatedStatementMonth,
      });
      nextTransactions.push(goalTx);
    }

    return {
      goals: updatedGoals,
      primaryBalance: state.primaryBalance - amount,
      transactions: nextTransactions,
    };
  }),

  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id),
  })),

  // Google Wallet
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

  // Shared Expenses
  addFriend: (name, linkedUserId) => set((state) => {
    const newFriend: Friend = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      linkedUserId,
      balance: 0,
    };
    return { friendsList: [...state.friendsList, newFriend] };
  }),

  settleDebt: (debtId) => set((state) => {
    const debt = state.debts.find((d) => d.id === debtId);
    if (!debt) return {};

    const updatedDebts = state.debts.map((d) => {
      if (d.id === debtId) {
        return { ...d, isSettled: true };
      }
      return d;
    });

    const updatedFriends = state.friendsList.map((f) => {
      if (f.name.toLowerCase() === debt.friendName.toLowerCase()) {
        return { ...f, balance: f.balance - debt.amount };
      }
      return f;
    });

    // Log an income transaction representing the settlement
    const debitPM = state.paymentMethods.find((pm) => pm.type === 'debit');
    let nextTransactions = [...state.transactions];

    if (debitPM) {
      const calculatedStatementMonth = calculateStatementMonth(
        new Date(),
        debitPM.type,
        debitPM.closureDay ?? undefined
      );

      const settlementTx = new Transaction({
        userId: 'user-1',
        paymentMethodId: debitPM.id!,
        amount: debt.amount,
        type: 'income',
        date: new Date(),
        description: `Settlement from ${debt.friendName}`,
        paymentStatus: 'paid',
        statementMonth: calculatedStatementMonth,
      });

      nextTransactions.push(settlementTx);
    }

    return {
      debts: updatedDebts,
      friendsList: updatedFriends,
      transactions: nextTransactions,
      primaryBalance: state.primaryBalance + debt.amount,
    };
  }),

  reset: () => set({
    primaryBalance: INITIAL_BALANCE,
    isPrivate: false,
    transactions: getMockTransactions(),
    paymentMethods: getMockPaymentMethods(),
    categories: getMockCategories(),
    goals: getMockGoals(),
    tags: [
      { id: 'tag-1', userId: 'user-1', name: 'vacation2026' },
      { id: 'tag-2', userId: 'user-1', name: 'essential' },
    ],
    friendsList: getMockFriends(),
    debts: [],
    autoCategoryRules: [
      { id: 'rule-1', substring: 'uber', categoryId: 'cat-transport' },
      { id: 'rule-2', substring: 'market', categoryId: 'cat-groceries' },
    ],
    enableWalletInterceptor: false,
    walletDrafts: [],
  }),
}));

if (typeof window !== 'undefined') {
  (window as any).useFinanceStore = useFinanceStore;
}
