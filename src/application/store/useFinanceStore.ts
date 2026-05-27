import { create } from 'zustand';
import { Transaction } from '../../domain/entities/Transaction';
import { PaymentMethod } from '../../domain/entities/PaymentMethod';
import { calculateStatementMonth } from '../use-cases/CalculateStatementMonth';
import { supabase } from '../../infrastructure/supabase';

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
  userId?: string;
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
  tags?: string[];
  splitWithFriend?: string | null;
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

  // Auth State
  user: any | null;
  session: any | null;
  loadingAuth: boolean;

  initializeAuth: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserData: () => Promise<void>;

  togglePrivacy: () => void;
  setPrimaryBalance: (balance: number) => Promise<void>;
  addTransaction: (input: AddTransactionInput) => Promise<void>;
  deleteTransaction: (id: string | undefined) => Promise<void>;
  editTransactionException: (id: string, type: 'this' | 'future' | 'all', updatedFields: Partial<AddTransactionInput>) => void;
  
  // Payment Methods
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  
  // Categories & Tags
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (name: string) => Promise<void>;
  addAutoCategoryRule: (substring: string, categoryId: string) => void;
  deleteAutoCategoryRule: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'currentSavings' | 'createdAt'>) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Google Wallet
  setEnableWalletInterceptor: (enabled: boolean) => Promise<void>;
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

  // Auth Initial State
  user: null,
  session: null,
  loadingAuth: true,

  initializeAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        set({ session, user: session.user, loadingAuth: false });
        get().loadUserData();
      } else {
        set({ session: null, user: null, loadingAuth: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ session, user: session.user, loadingAuth: false });
        get().loadUserData();
      } else {
        set({ session: null, user: null, loadingAuth: false });
        get().reset(); // Reset to guest state on logout
      }
    });
  },

  signUp: async (email, password) => {
    set({ loadingAuth: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loadingAuth: false });
      throw error;
    }
    if (data.session) {
      set({ session: data.session, user: data.session.user, loadingAuth: false });
      await get().loadUserData();
    } else {
      set({ loadingAuth: false });
    }
  },

  signIn: async (email, password) => {
    set({ loadingAuth: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loadingAuth: false });
      throw error;
    }
    set({ session: data.session, user: data.user, loadingAuth: false });
    await get().loadUserData();
  },

  signOut: async () => {
    set({ loadingAuth: true });
    await supabase.auth.signOut();
  },

  loadUserData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // 1. Fetch User Settings
      const { data: settings, error: settingsErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsErr) throw settingsErr;

      let primaryBalance = INITIAL_BALANCE;
      let enableWalletInterceptor = false;
      let friendsList = getMockFriends();

      if (settings) {
        primaryBalance = parseFloat(settings.primary_balance);
        enableWalletInterceptor = settings.enable_wallet_interceptor;
        friendsList = settings.friends_list || [];
      } else {
        // Create initial settings if not exists
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            primary_balance: INITIAL_BALANCE,
            enable_wallet_interceptor: false,
            friends_list: friendsList,
          });
      }

      // 2. Fetch Payment Methods
      const { data: pmData, error: pmErr } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id);

      if (pmErr) throw pmErr;

      let paymentMethods: PaymentMethod[] = [];
      if (pmData && pmData.length > 0) {
        paymentMethods = pmData.map(
          (pm) =>
            new PaymentMethod({
              id: pm.id,
              userId: pm.user_id,
              name: pm.name,
              type: pm.type as 'debit' | 'credit',
              closureDay: pm.closure_day,
              dueDay: pm.due_day,
              icon: pm.icon,
              color: pm.color,
            })
        );
      } else {
        // Populate defaults
        const defaults = getMockPaymentMethods();
        for (const item of defaults) {
          const { data: inserted, error: insertErr } = await supabase
            .from('payment_methods')
            .insert({
              user_id: user.id,
              name: item.name,
              type: item.type,
              closure_day: item.closureDay || null,
              due_day: item.dueDay || null,
              icon: item.icon || null,
              color: item.color,
            })
            .select()
            .single();

          if (!insertErr && inserted) {
            paymentMethods.push(
              new PaymentMethod({
                id: inserted.id,
                userId: inserted.user_id,
                name: inserted.name,
                type: inserted.type as 'debit' | 'credit',
                closureDay: inserted.closure_day,
                dueDay: inserted.due_day,
                icon: inserted.icon,
                color: inserted.color,
              })
            );
          }
        }
      }

      // 3. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (catErr) throw catErr;

      let categories: Category[] = [];
      if (catData && catData.length > 0) {
        categories = catData.map((cat) => ({
          id: cat.id,
          userId: cat.user_id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
        }));
      } else {
        // Populate defaults
        const defaults = getMockCategories();
        for (const item of defaults) {
          const { data: inserted, error: insertErr } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: item.name,
              color: item.color,
              icon: item.icon || null,
            })
            .select()
            .single();

          if (!insertErr && inserted) {
            categories.push({
              id: inserted.id,
              userId: inserted.user_id,
              name: inserted.name,
              color: inserted.color,
              icon: inserted.icon,
            });
          }
        }
      }

      // 4. Fetch Goals
      const { data: goalData, error: goalErr } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalErr) throw goalErr;

      let goals: Goal[] = [];
      if (goalData && goalData.length > 0) {
        goals = goalData.map((g) => ({
          id: g.id,
          userId: g.user_id,
          name: g.name,
          targetAmount: parseFloat(g.target_amount),
          currentSavings: parseFloat(g.current_savings),
          deadline: g.deadline ? new Date(g.deadline) : null,
          color: g.color,
          icon: g.icon,
          createdAt: new Date(g.created_at),
        }));
      } else {
        // Populate defaults
        const defaults = getMockGoals();
        for (const item of defaults) {
          const { data: inserted, error: insertErr } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              name: item.name,
              target_amount: item.targetAmount,
              current_savings: item.currentSavings,
              deadline: item.deadline ? item.deadline.toISOString().slice(0, 10) : null,
              color: item.color,
              icon: item.icon || null,
            })
            .select()
            .single();

          if (!insertErr && inserted) {
            goals.push({
              id: inserted.id,
              userId: inserted.user_id,
              name: inserted.name,
              targetAmount: parseFloat(inserted.target_amount),
              currentSavings: parseFloat(inserted.current_savings),
              deadline: inserted.deadline ? new Date(inserted.deadline) : null,
              color: inserted.color,
              icon: inserted.icon,
              createdAt: new Date(inserted.created_at),
            });
          }
        }
      }

      // 5. Fetch Transactions
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (txErr) throw txErr;

      let transactions: Transaction[] = [];
      if (txData && txData.length > 0) {
        transactions = txData.map(
          (t) =>
            new Transaction({
              id: t.id,
              userId: t.user_id,
              paymentMethodId: t.payment_method_id,
              categoryId: t.category_id,
              goalId: t.goal_id,
              amount: parseFloat(t.amount),
              type: t.type as 'income' | 'expense' | 'transfer',
              date: new Date(t.date),
              description: t.description,
              paymentStatus: t.payment_status as 'paid' | 'pending',
              isRecurring: t.is_recurring,
              installmentId: t.installment_id,
              installmentNumber: t.installment_number,
              totalInstallments: t.total_installments,
              statementMonth: new Date(t.statement_month),
              notes: t.notes,
            })
        );
      } else {
        // Populate defaults
        const defaults = getMockTransactions();
        for (const item of defaults) {
          const matchPm = paymentMethods.find((p) => p.name === (item.paymentMethodId === 'pay-debit' ? 'Liquid Cash' : item.paymentMethodId === 'pay-credit-visa' ? 'Visa Gold' : 'Master Reserve'));
          const matchCat = categories.find((c) => c.name === (item.categoryId === 'cat-salary' ? 'Salary' : item.categoryId === 'cat-leisure' ? 'Leisure' : 'Groceries'));

          if (matchPm) {
            const { data: inserted, error: insertErr } = await supabase
              .from('transactions')
              .insert({
                user_id: user.id,
                payment_method_id: matchPm.id!,
                category_id: matchCat?.id || null,
                amount: item.amount,
                type: item.type,
                date: item.date.toISOString().slice(0, 10),
                description: item.description,
                payment_status: item.paymentStatus,
                statement_month: item.statementMonth.toISOString().slice(0, 10),
                notes: item.notes || null,
              })
              .select()
              .single();

            if (!insertErr && inserted) {
              transactions.push(
                new Transaction({
                  id: inserted.id,
                  userId: inserted.user_id,
                  paymentMethodId: inserted.payment_method_id,
                  categoryId: inserted.category_id,
                  amount: parseFloat(inserted.amount),
                  type: inserted.type as 'income' | 'expense' | 'transfer',
                  date: new Date(inserted.date),
                  description: inserted.description,
                  paymentStatus: inserted.payment_status as 'paid' | 'pending',
                  statementMonth: new Date(inserted.statement_month),
                  notes: inserted.notes,
                })
              );
            }
          }
        }
      }

      // 6. Fetch Tags
      const { data: tagData, error: tagErr } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);

      let tags: Tag[] = [];
      if (!tagErr && tagData) {
        tags = tagData.map((t) => ({ id: t.id, userId: t.user_id, name: t.name }));
      }

      set({
        primaryBalance,
        enableWalletInterceptor,
        friendsList,
        paymentMethods,
        categories,
        goals,
        transactions,
        tags,
      });

    } catch (err: any) {
      console.error('Failed to load user data from Supabase:', err);
    }
  },

  togglePrivacy: () => set((state) => ({ isPrivate: !state.isPrivate })),

  setPrimaryBalance: async (balance: number) => {
    const { user } = get();
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ primary_balance: balance })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to update balance in Supabase:', err);
      }
    }
    set({ primaryBalance: balance });
  },

  addTransaction: async (input: AddTransactionInput) => {
    const state = get();
    const { user } = state;

    const paymentMethod = state.paymentMethods.find((p) => p.id === input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error(`Payment method with ID ${input.paymentMethodId} not found`);
    }

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

    let updatedFriends = [...state.friendsList];
    let updatedDebts = [...state.debts];

    if (input.splitWithFriend && input.type === 'expense') {
      const friendName = input.splitWithFriend;
      const splitAmount = parseFloat((input.amount / 2).toFixed(2));
      const debtId = Math.random().toString(36).substring(2, 11);

      const newDebt: Debt = {
        id: debtId,
        userId: user ? user.id : 'user-1',
        friendName,
        amount: splitAmount,
        description: `Split expense: ${input.description}`,
        date: input.date,
        isSettled: false,
        createdAt: new Date(),
      };

      updatedDebts.push(newDebt);

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

    if (user) {
      try {
        for (const tx of transactionsToAdd) {
          const { data: insertedTx, error: txErr } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              payment_method_id: tx.paymentMethodId,
              category_id: tx.categoryId || null,
              goal_id: tx.goalId || null,
              amount: tx.amount,
              type: tx.type,
              date: tx.date.toISOString().slice(0, 10),
              description: tx.description,
              payment_status: tx.paymentStatus,
              is_recurring: tx.isRecurring || false,
              installment_id: tx.installmentId || null,
              installment_number: tx.installmentNumber || null,
              total_installments: tx.totalInstallments || null,
              statement_month: tx.statementMonth.toISOString().slice(0, 10),
              notes: tx.notes || null,
            })
            .select()
            .single();

          if (txErr) throw txErr;
          if (insertedTx) tx.id = insertedTx.id;

          if (input.tags && input.tags.length > 0) {
            for (const tagName of input.tags) {
              let { data: tag } = await supabase
                .from('tags')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', tagName)
                .maybeSingle();

              if (!tag) {
                const { data: newTag, error: newTagErr } = await supabase
                  .from('tags')
                  .insert({ user_id: user.id, name: tagName })
                  .select()
                  .single();
                if (newTagErr) throw newTagErr;
                tag = newTag;
              }

              if (tag) {
                await supabase
                  .from('transaction_tags')
                  .insert({ transaction_id: tx.id, tag_id: tag.id });
              }
            }
          }
        }

        const newBalance = state.primaryBalance + balanceChange;
        await supabase
          .from('user_settings')
          .update({ 
            primary_balance: newBalance,
            friends_list: updatedFriends
          })
          .eq('user_id', user.id);

      } catch (err) {
        console.error('Failed to sync transaction with Supabase:', err);
        throw err;
      }
    }

    set({
      transactions: [...state.transactions, ...transactionsToAdd],
      primaryBalance: state.primaryBalance + balanceChange,
      friendsList: updatedFriends,
      debts: updatedDebts,
    });
  },

  deleteTransaction: async (id) => {
    const state = get();
    const { user } = state;

    const transaction = state.transactions.find((t) => t.id === id || t.date.getTime() === (id as any) || t.description === id);
    if (!transaction) return;

    let balanceRestore = 0;
    if (transaction.type === 'income') {
      balanceRestore = -transaction.amount;
    } else if (transaction.type === 'expense' || transaction.type === 'transfer') {
      balanceRestore = transaction.amount;
    }

    if (user) {
      try {
        await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id);

        const newBalance = state.primaryBalance + balanceRestore;
        await supabase
          .from('user_settings')
          .update({ primary_balance: newBalance })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete transaction in Supabase:', err);
        throw err;
      }
    }

    set({
      transactions: state.transactions.filter((t) => t.id !== transaction.id),
      primaryBalance: state.primaryBalance + balanceRestore,
    });
  },

  editTransactionException: (id, type, updatedFields) => set((state) => {
    const index = state.transactions.findIndex((t) => t.installmentId === id || t.description === id);
    if (index < 0) return {};

    const updatedTransactions = [...state.transactions];
    const target = updatedTransactions[index];

    if (type === 'this') {
      updatedTransactions[index] = new Transaction({
        ...target,
        ...updatedFields,
        date: updatedFields.date ? new Date(updatedFields.date) : target.date,
        statementMonth: target.statementMonth,
      });
    } else if (type === 'all' || type === 'future') {
      const targetInstallmentId = target.installmentId;
      updatedTransactions.forEach((t, i) => {
        if (targetInstallmentId && t.installmentId === targetInstallmentId) {
          if (type === 'all' || (type === 'future' && t.date >= target.date)) {
            updatedTransactions[i] = new Transaction({
              ...t,
              ...updatedFields,
              date: t.date,
              statementMonth: t.statementMonth,
            });
          }
        }
      });
    }

    return { transactions: updatedTransactions };
  }),

  addPaymentMethod: async (pm) => {
    const state = get();
    const { user } = state;
    let newId = Math.random().toString(36).substring(2, 11);

    if (user) {
      try {
        const { data: inserted, error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            name: pm.name,
            type: pm.type,
            closure_day: pm.closureDay || null,
            due_day: pm.dueDay || null,
            icon: pm.icon || null,
            color: pm.color,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) newId = inserted.id;
      } catch (err) {
        console.error('Failed to add payment method in Supabase:', err);
        throw err;
      }
    }

    const newPm = new PaymentMethod({ ...pm, id: newId });
    set({ paymentMethods: [...state.paymentMethods, newPm] });
  },

  deletePaymentMethod: async (id) => {
    const state = get();
    const { user } = state;

    if (user) {
      try {
        await supabase
          .from('payment_methods')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Failed to delete payment method in Supabase:', err);
        throw err;
      }
    }

    set({ paymentMethods: state.paymentMethods.filter((pm) => pm.id !== id) });
  },

  addCategory: async (cat) => {
    const state = get();
    const { user } = state;
    let newId = Math.random().toString(36).substring(2, 11);

    if (user) {
      try {
        const { data: inserted, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) newId = inserted.id;
      } catch (err) {
        console.error('Failed to add category in Supabase:', err);
        throw err;
      }
    }

    const newCat: Category = { ...cat, id: newId };
    set({ categories: [...state.categories, newCat] });
  },

  deleteCategory: async (id) => {
    const state = get();
    const { user } = state;

    if (user) {
      try {
        await supabase
          .from('categories')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Failed to delete category in Supabase:', err);
        throw err;
      }
    }

    set({ categories: state.categories.filter((cat) => cat.id !== id) });
  },

  addTag: async (name) => {
    const state = get();
    const { user } = state;
    let newId = Math.random().toString(36).substring(2, 11);

    if (user) {
      try {
        const { data: inserted, error } = await supabase
          .from('tags')
          .insert({ user_id: user.id, name })
          .select()
          .single();

        if (error) throw error;
        if (inserted) newId = inserted.id;
      } catch (err) {
        console.error('Failed to add tag in Supabase:', err);
        throw err;
      }
    }

    const newTag: Tag = { id: newId, userId: user ? user.id : 'user-1', name };
    set({ tags: [...state.tags, newTag] });
  },

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

  addGoal: async (goal) => {
    const state = get();
    const { user } = state;
    let newId = Math.random().toString(36).substring(2, 11);

    if (user) {
      try {
        const { data: inserted, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_savings: 0,
            deadline: goal.deadline ? goal.deadline.toISOString().slice(0, 10) : null,
            color: goal.color,
            icon: goal.icon || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) newId = inserted.id;
      } catch (err) {
        console.error('Failed to add goal in Supabase:', err);
        throw err;
      }
    }

    const newGoal: Goal = {
      ...goal,
      id: newId,
      currentSavings: 0,
      createdAt: new Date(),
    };
    set({ goals: [...state.goals, newGoal] });
  },

  contributeToGoal: async (id, amount) => {
    const state = get();
    const { user } = state;

    const targetGoal = state.goals.find((g) => g.id === id);
    if (!targetGoal) return;

    const updatedGoals = state.goals.map((g) => {
      if (g.id === id) {
        return { ...g, currentSavings: g.currentSavings + amount };
      }
      return g;
    });

    const transferPm = state.paymentMethods.find((pm) => pm.type === 'debit');
    let nextTransactions = [...state.transactions];
    let goalTx: Transaction | null = null;

    if (transferPm) {
      const calculatedStatementMonth = calculateStatementMonth(
        new Date(),
        transferPm.type,
        transferPm.closureDay ?? undefined
      );

      goalTx = new Transaction({
        userId: user ? user.id : 'user-1',
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

    if (user) {
      try {
        await supabase
          .from('goals')
          .update({ current_savings: targetGoal.currentSavings + amount })
          .eq('id', id);

        if (goalTx) {
          await supabase.from('transactions').insert({
            user_id: user.id,
            payment_method_id: goalTx.paymentMethodId,
            goal_id: goalTx.goalId,
            amount: goalTx.amount,
            type: goalTx.type,
            date: goalTx.date.toISOString().slice(0, 10),
            description: goalTx.description,
            payment_status: goalTx.paymentStatus,
            statement_month: goalTx.statementMonth.toISOString().slice(0, 10),
          });
        }

        const newBalance = state.primaryBalance - amount;
        await supabase
          .from('user_settings')
          .update({ primary_balance: newBalance })
          .eq('user_id', user.id);

      } catch (err) {
        console.error('Failed to contribute to goal in Supabase:', err);
        throw err;
      }
    }

    set({
      goals: updatedGoals,
      primaryBalance: state.primaryBalance - amount,
      transactions: nextTransactions,
    });
  },

  deleteGoal: async (id) => {
    const state = get();
    const { user } = state;

    if (user) {
      try {
        await supabase
          .from('goals')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Failed to delete goal in Supabase:', err);
        throw err;
      }
    }

    set({ goals: state.goals.filter((g) => g.id !== id) });
  },

  setEnableWalletInterceptor: async (enabled: boolean) => {
    const state = get();
    const { user } = state;

    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ enable_wallet_interceptor: enabled })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to toggle wallet interceptor in Supabase:', err);
        throw err;
      }
    }

    set({ enableWalletInterceptor: enabled });
  },

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
