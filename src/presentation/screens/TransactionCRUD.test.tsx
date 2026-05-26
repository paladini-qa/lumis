import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Mock react-native-reanimated for Jest environment
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (cb: any) => cb(),
    withSpring: (val: any) => val,
    withTiming: (val: any) => val,
    default: {
      View: View,
    },
  };
});

import { DashboardScreen } from './DashboardScreen';
import { useFinanceStore } from '../../application/store/useFinanceStore';

beforeEach(() => {
  useFinanceStore.getState().reset();
});

describe('Transactions CRUD & Statement Rollover Integration Tests (TDD - RED)', () => {
  it('should render date-scroll listing, search box, and filtering elements', () => {
    const { getByText, getByPlaceholderText } = render(<DashboardScreen />);

    // 1. Check Date Scroll Header exists (defaults to May 2026)
    expect(getByText('MAY 2026')).toBeTruthy();

    // 2. Check search box exists
    expect(getByPlaceholderText('Search by description...')).toBeTruthy();

    // 3. Check filter type pills exist
    expect(getByText('ALL')).toBeTruthy();
    expect(getByText('INCOME')).toBeTruthy();
    expect(getByText('EXPENSE')).toBeTruthy();
  });

  it('should filter transactions list dynamically based on search query', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<DashboardScreen />);

    // Initial state: all mock transactions are displayed
    expect(getByText('Elite Gym Membership')).toBeTruthy();
    expect(getByText('Obsidian Cafe')).toBeTruthy();
    
    // Type search query
    const searchInput = getByPlaceholderText('Search by description...');
    fireEvent.changeText(searchInput, 'Gym');

    // Filtered state: only matching items displayed
    expect(getByText('Elite Gym Membership')).toBeTruthy();
    expect(queryByText('Obsidian Cafe')).toBeNull();
  });

  it('should open TransactionModal, log transaction, update balance, and calculate statement month rollover', () => {
    const { getByText, getByPlaceholderText, getAllByText, queryByText } = render(<DashboardScreen />);

    // Initial balance checking
    expect(getAllByText('R$ 18.450,72').length).toBeGreaterThan(0);

    // Open transaction entry modal via Log Trans. quick action button
    const logButton = getByText('Log Trans.');
    fireEvent.press(logButton);

    // Modal should be visible
    expect(getByText('LOG TRANSACTION')).toBeTruthy();

    // Fill out form
    const amountInput = getByPlaceholderText('0,00');
    const descInput = getByPlaceholderText('e.g. Supermarket, Salary, Coffee');
    const dateInput = getByPlaceholderText('YYYY-MM-DD');

    fireEvent.changeText(amountInput, '150,00');
    fireEvent.changeText(descInput, 'Wine Tasting Premium');
    fireEvent.changeText(dateInput, '2026-05-12'); // Closure is May 10th for Visa, rolls over to June

    // Open Payment Method Dropdown picker and select Visa Gold credit card
    fireEvent.press(getByText('Liquid Cash (DEBIT)'));
    fireEvent.press(getByText('Visa Gold'));

    // Log the transaction
    const submitBtn = getByText('LOG FLOW');
    fireEvent.press(submitBtn);

    // Modal should close
    expect(queryByText('LOG TRANSACTION')).toBeNull();

    // 1. Balance should update: initial R$ 18.450,72 - expense R$ 150,00 = R$ 18.300,72
    expect(getAllByText('R$ 18.300,72').length).toBeGreaterThan(0);

    // 2. Rollover check:
    // Selected month defaults to MAY 2026.
    // Since the credit transaction was logged on May 12th (closure is May 10th),
    // it rolls over to the June statement month, and should NOT be visible under MAY 2026!
    expect(queryByText('Wine Tasting Premium')).toBeNull();

    // Now, let's scroll/click to view JUNE 2026 statement cycle
    const nextMonthBtn = getByText('▶');
    fireEvent.press(nextMonthBtn);

    // Selected month is now JUNE 2026
    expect(getByText('JUNE 2026')).toBeTruthy();

    // The rolled-over transaction should now be visible under June statement!
    expect(getByText('Wine Tasting Premium')).toBeTruthy();
  });
});
