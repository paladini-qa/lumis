import { useFinanceStore } from './useFinanceStore';
import { Transaction } from '../../domain/entities/Transaction';

// Mock active store state reset before each test
beforeEach(() => {
  const store = useFinanceStore.getState();
  // We'll define a reset function or manually reset to initial values
  if (store && typeof store.reset === 'function') {
    store.reset();
  }
});

describe('useFinanceStore Zustand Store (TDD - RED)', () => {
  it('should have initial state with primaryBalance, isPrivate, and default transactions', () => {
    const state = useFinanceStore.getState();
    expect(state.primaryBalance).toBe(18450.72);
    expect(state.isPrivate).toBe(false);
    expect(state.transactions).toBeInstanceOf(Array);
    // There should be a couple of default mock transactions for dashboard demo
    expect(state.transactions.length).toBeGreaterThan(0);
  });

  it('should toggle isPrivate when togglePrivacy is called', () => {
    const stateBefore = useFinanceStore.getState();
    expect(stateBefore.isPrivate).toBe(false);

    stateBefore.togglePrivacy();

    const stateAfter = useFinanceStore.getState();
    expect(stateAfter.isPrivate).toBe(true);

    stateAfter.togglePrivacy();
    expect(useFinanceStore.getState().isPrivate).toBe(false);
  });

  it('should update primaryBalance when setPrimaryBalance is called', () => {
    useFinanceStore.getState().setPrimaryBalance(5000.50);
    expect(useFinanceStore.getState().primaryBalance).toBe(5000.50);
  });

  it('should add a transaction and update primaryBalance for income type', () => {
    const initialBalance = useFinanceStore.getState().primaryBalance;
    const newTransaction = new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-1',
      amount: 1000.00,
      type: 'income',
      date: new Date('2026-05-26'),
      description: 'Freelance work',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
    });

    useFinanceStore.getState().addTransaction(newTransaction);

    const state = useFinanceStore.getState();
    expect(state.transactions[state.transactions.length - 1]).toEqual(newTransaction);
    expect(state.primaryBalance).toBe(initialBalance + 1000.00);
  });

  it('should add a transaction and update primaryBalance for expense type', () => {
    const initialBalance = useFinanceStore.getState().primaryBalance;
    const newTransaction = new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-1',
      amount: 450.00,
      type: 'expense',
      date: new Date('2026-05-26'),
      description: 'Supermarket',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
    });

    useFinanceStore.getState().addTransaction(newTransaction);

    const state = useFinanceStore.getState();
    expect(state.transactions[state.transactions.length - 1]).toEqual(newTransaction);
    expect(state.primaryBalance).toBe(initialBalance - 450.00);
  });

  it('should add a transaction and update primaryBalance for transfer type (saving goal contribution)', () => {
    const initialBalance = useFinanceStore.getState().primaryBalance;
    const newTransaction = new Transaction({
      userId: 'user-1',
      paymentMethodId: 'pay-1',
      goalId: 'goal-1',
      amount: 200.00,
      type: 'transfer',
      date: new Date('2026-05-26'),
      description: 'Savings contribution',
      paymentStatus: 'paid',
      statementMonth: new Date('2026-05-01'),
    });

    useFinanceStore.getState().addTransaction(newTransaction);

    const state = useFinanceStore.getState();
    expect(state.transactions[state.transactions.length - 1]).toEqual(newTransaction);
    expect(state.primaryBalance).toBe(initialBalance - 200.00);
  });
});
