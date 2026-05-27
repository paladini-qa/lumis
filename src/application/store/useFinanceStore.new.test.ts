import { useFinanceStore } from './useFinanceStore';

beforeEach(() => {
  useFinanceStore.getState().reset();
});

describe('useFinanceStore - New Capabilities (TDD)', () => {
  it('should auto-generate installment transaction series', () => {
    const state = useFinanceStore.getState();
    const creditPM = state.paymentMethods.find((p) => p.type === 'credit')!;

    state.addTransaction({
      userId: 'user-1',
      paymentMethodId: creditPM.id!,
      amount: 300.00,
      type: 'expense',
      date: new Date('2026-05-05'),
      description: 'Furniture Store',
      paymentStatus: 'paid',
      totalInstallments: 3,
    });

    const updatedState = useFinanceStore.getState();
    // Preloaded was 4 transactions. Added 3 installment transactions = 7 total.
    expect(updatedState.transactions.length).toBe(7);

    const installments = updatedState.transactions.filter(
      (t) => t.description === 'Furniture Store'
    );
    expect(installments.length).toBe(3);

    // Verify correct installment numbers and values
    expect(installments[0].installmentNumber).toBe(1);
    expect(installments[0].amount).toBe(100.00);
    expect(installments[0].totalInstallments).toBe(3);

    expect(installments[1].installmentNumber).toBe(2);
    expect(installments[1].amount).toBe(100.00);

    expect(installments[2].installmentNumber).toBe(3);
    expect(installments[2].amount).toBe(100.00);

    // Verify statement month increments
    expect(installments[0].statementMonth.toISOString().slice(0, 10)).toBe('2026-05-01');
    expect(installments[1].statementMonth.toISOString().slice(0, 10)).toBe('2026-06-01');
    expect(installments[2].statementMonth.toISOString().slice(0, 10)).toBe('2026-07-01');
  });

  it('should auto-categorize transactions using text matching rules', () => {
    const state = useFinanceStore.getState();
    const debitPM = state.paymentMethods.find((p) => p.type === 'debit')!;

    state.addTransaction({
      userId: 'user-1',
      paymentMethodId: debitPM.id!,
      amount: 12.50,
      type: 'expense',
      date: new Date('2026-05-25'),
      description: 'Uber Ride to Airport', // Contains 'uber' which maps to 'cat-transport'
      paymentStatus: 'paid',
    });

    const updatedState = useFinanceStore.getState();
    const addedTx = updatedState.transactions.find((t) => t.description === 'Uber Ride to Airport');
    expect(addedTx).toBeDefined();
    expect(addedTx?.categoryId).toBe('cat-transport');
  });

  it('should log hybrid split debts and adjust friend balances', () => {
    const state = useFinanceStore.getState();
    const debitPM = state.paymentMethods.find((p) => p.type === 'debit')!;

    state.addTransaction({
      userId: 'user-1',
      paymentMethodId: debitPM.id!,
      amount: 80.00,
      type: 'expense',
      date: new Date('2026-05-25'),
      description: 'Shared Lunch',
      paymentStatus: 'paid',
      splitWithFriend: 'Alice', // Alice is mock friend 1, initial balance was R$ 50
    });

    const updatedState = useFinanceStore.getState();
    const alice = updatedState.friendsList.find((f) => f.name === 'Alice')!;
    expect(alice.balance).toBe(90.00); // 50 + 40 (half of 80)

    expect(updatedState.debts.length).toBe(1);
    expect(updatedState.debts[0].friendName).toBe('Alice');
    expect(updatedState.debts[0].amount).toBe(40.00);
    expect(updatedState.debts[0].isSettled).toBe(false);
  });

  it('should process goal contributions and transfer balances correctly', () => {
    const state = useFinanceStore.getState();
    const initialBalance = state.primaryBalance;
    const emergencyFund = state.goals.find((g) => g.name === 'Emergency Fund')!;

    state.contributeToGoal(emergencyFund.id, 500.00);

    const updatedState = useFinanceStore.getState();
    const fundAfter = updatedState.goals.find((g) => g.name === 'Emergency Fund')!;
    expect(fundAfter.currentSavings).toBe(emergencyFund.currentSavings + 500.00);
    expect(updatedState.primaryBalance).toBe(initialBalance - 500.00);

    // Verify transfer transaction logged
    const transferTx = updatedState.transactions.find(
      (t) => t.type === 'transfer' && t.goalId === emergencyFund.id
    );
    expect(transferTx).toBeDefined();
    expect(transferTx?.amount).toBe(500.00);
  });
});
