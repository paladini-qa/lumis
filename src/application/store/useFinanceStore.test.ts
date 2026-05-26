import { useFinanceStore } from './useFinanceStore';
import { Transaction } from '../../domain/entities/Transaction';

beforeEach(() => {
  useFinanceStore.getState().reset();
});

describe('useFinanceStore Zustand Store Extensions (TDD - RED)', () => {
  it('should preload list of payment methods and categories', () => {
    const state = useFinanceStore.getState();
    
    // Check payment methods preloaded
    expect(state.paymentMethods).toBeInstanceOf(Array);
    expect(state.paymentMethods.length).toBeGreaterThan(0);
    
    const debitCard = state.paymentMethods.find(p => p.type === 'debit');
    expect(debitCard).toBeDefined();
    expect(debitCard?.name).toBe('Liquid Cash');

    const creditCard = state.paymentMethods.find(p => p.type === 'credit');
    expect(creditCard).toBeDefined();
    expect(creditCard?.closureDay).toBeDefined();

    // Check categories preloaded
    expect(state.categories).toBeInstanceOf(Array);
    expect(state.categories.length).toBeGreaterThan(0);
    
    const groceries = state.categories.find(c => c.name === 'Groceries');
    expect(groceries).toBeDefined();
  });

  it('should automatically calculate and assign statementMonth on addTransaction', () => {
    const state = useFinanceStore.getState();
    
    // 1. Debit transaction (should be same month)
    const debitPM = state.paymentMethods.find(p => p.type === 'debit')!;
    const debitTxInput = {
      userId: 'user-1',
      paymentMethodId: debitPM.id,
      amount: 100.00,
      type: 'expense' as const,
      date: new Date('2026-05-25'),
      description: 'Supermarket Debit',
      paymentStatus: 'paid' as const,
    };

    state.addTransaction(debitTxInput);
    
    const addedDebitTx = useFinanceStore.getState().transactions.slice(-1)[0];
    expect(addedDebitTx.statementMonth.toISOString().slice(0, 10)).toBe('2026-05-01');

    // 2. Credit transaction BEFORE closure day (should be same month)
    const creditPM = state.paymentMethods.find(p => p.type === 'credit' && p.closureDay === 10)!;
    const creditTxBeforeInput = {
      userId: 'user-1',
      paymentMethodId: creditPM.id,
      amount: 150.00,
      type: 'expense' as const,
      date: new Date('2026-05-05'), // May 5th is before closure day (10th)
      description: 'Restaurant Card',
      paymentStatus: 'paid' as const,
    };

    state.addTransaction(creditTxBeforeInput);
    
    const addedCreditTxBefore = useFinanceStore.getState().transactions.slice(-1)[0];
    expect(addedCreditTxBefore.statementMonth.toISOString().slice(0, 10)).toBe('2026-05-01');

    // 3. Credit transaction ON or AFTER closure day (should roll over to NEXT month)
    const creditTxAfterInput = {
      userId: 'user-1',
      paymentMethodId: creditPM.id,
      amount: 250.00,
      type: 'expense' as const,
      date: new Date('2026-05-12'), // May 12th is after closure day (10th)
      description: 'Online Purchase Card',
      paymentStatus: 'paid' as const,
    };

    state.addTransaction(creditTxAfterInput);
    
    const addedCreditTxAfter = useFinanceStore.getState().transactions.slice(-1)[0];
    expect(addedCreditTxAfter.statementMonth.toISOString().slice(0, 10)).toBe('2026-06-01');
  });

  it('should adjust primaryBalance and log transaction correctly', () => {
    const initialBalance = useFinanceStore.getState().primaryBalance;
    const debitPM = useFinanceStore.getState().paymentMethods.find(p => p.type === 'debit')!;
    
    // Add income
    useFinanceStore.getState().addTransaction({
      userId: 'user-1',
      paymentMethodId: debitPM.id,
      amount: 500.00,
      type: 'income',
      date: new Date('2026-05-26'),
      description: 'Extra work',
      paymentStatus: 'paid',
    });

    expect(useFinanceStore.getState().primaryBalance).toBe(initialBalance + 500.00);

    // Add expense
    useFinanceStore.getState().addTransaction({
      userId: 'user-1',
      paymentMethodId: debitPM.id,
      amount: 150.00,
      type: 'expense',
      date: new Date('2026-05-26'),
      description: 'Lunch',
      paymentStatus: 'paid',
    });

    expect(useFinanceStore.getState().primaryBalance).toBe(initialBalance + 350.00);
  });

  describe('Google Wallet Interceptor Store Actions (TDD - RED)', () => {
    it('should initialize with default interceptor settings and empty drafts queue', () => {
      const state = useFinanceStore.getState();
      expect(state.enableWalletInterceptor).toBe(false);
      expect(state.walletDrafts).toEqual([]);
    });

    it('should toggle enableWalletInterceptor setting', () => {
      const state = useFinanceStore.getState();
      expect(state.enableWalletInterceptor).toBe(false);

      state.setEnableWalletInterceptor(true);
      expect(useFinanceStore.getState().enableWalletInterceptor).toBe(true);

      state.setEnableWalletInterceptor(false);
      expect(useFinanceStore.getState().enableWalletInterceptor).toBe(false);
    });

    it('should add, remove, and clear wallet drafts correctly', () => {
      const state = useFinanceStore.getState();

      const draftInput = {
        amount: 29.90,
        date: new Date('2026-05-26'),
        description: 'Starbucks',
        paymentMethodSuggested: 'credit' as const,
        notes: 'Intercepted Google Wallet transaction',
      };

      state.addWalletDraft(draftInput);

      let updatedState = useFinanceStore.getState();
      expect(updatedState.walletDrafts.length).toBe(1);
      
      const addedDraft = updatedState.walletDrafts[0];
      expect(addedDraft.id).toBeDefined();
      expect(addedDraft.amount).toBe(29.90);
      expect(addedDraft.description).toBe('Starbucks');
      expect(addedDraft.paymentMethodSuggested).toBe('credit');
      expect(addedDraft.createdAt).toBeInstanceOf(Date);

      // Add a second draft
      state.addWalletDraft({
        amount: 15.00,
        date: new Date('2026-05-26'),
        description: 'Uber',
        paymentMethodSuggested: 'debit' as const,
      });

      updatedState = useFinanceStore.getState();
      expect(updatedState.walletDrafts.length).toBe(2);

      // Remove the first draft
      state.removeWalletDraft(addedDraft.id);
      updatedState = useFinanceStore.getState();
      expect(updatedState.walletDrafts.length).toBe(1);
      expect(updatedState.walletDrafts[0].description).toBe('Uber');

      // Clear all remaining drafts
      state.clearWalletDrafts();
      updatedState = useFinanceStore.getState();
      expect(updatedState.walletDrafts).toEqual([]);
    });
  });
});
