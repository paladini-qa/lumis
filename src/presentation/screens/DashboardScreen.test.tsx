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

// Mock active store state reset before each test
beforeEach(() => {
  useFinanceStore.getState().reset();
});

describe('DashboardScreen Component Layout & State Integration (TDD - RED)', () => {
  it('should render the brand wordmark, BalanceCard, quick actions, monthly summary, and recent transactions', () => {
    const { getByText, getByTestId, getAllByText } = render(<DashboardScreen />);

    // 1. Brand Wordmark (Marcellus style)
    expect(getByText('LUMIS')).toBeTruthy();

    // 2. BalanceCard
    expect(getByText('Primary Balance')).toBeTruthy();
    expect(getAllByText('R$ 18.450,72').length).toBeGreaterThan(0);

    // 3. Quick Actions
    expect(getByText('Log Trans.')).toBeTruthy();
    expect(getByText('Transfer')).toBeTruthy();
    expect(getByText('Pay Card')).toBeTruthy();
    expect(getByText('Savings Goals')).toBeTruthy();

    // 4. Monthly Summary Section
    expect(getByText('Monthly Summary')).toBeTruthy();
    expect(getByText('Total Incomes')).toBeTruthy();
    expect(getByText('Total Expenses')).toBeTruthy();
    expect(getByText('Forecast')).toBeTruthy();

    // Sum calculation checks based on initial mock transactions:
    // Incomes: R$ 20.000,00
    // Expenses: R$ 350.00 + R$ 48.50 + R$ 1.150.78 = R$ 1.549,28
    // Net / Forecast: R$ 18.450,72
    expect(getAllByText('R$ 20.000,00').length).toBeGreaterThan(0);
    expect(getByText('R$ 1.549,28')).toBeTruthy();

    // 5. Recent Transactions Header & Items
    expect(getByText('Recent Transactions')).toBeTruthy();
    expect(getByText('Monthly Salary Payment')).toBeTruthy();
    expect(getByText('Elite Gym Membership')).toBeTruthy();
    expect(getByText('Obsidian Cafe')).toBeTruthy();
    expect(getByText('Reserve Wine Shop')).toBeTruthy();
  });

  it('should toggle privacy across the whole screen when BalanceCard eye is toggled', () => {
    const { getByText, queryByText, getByTestId, getAllByText, queryAllByText, getAllByTestId } = render(<DashboardScreen />);

    // Initial state: values are visible
    expect(getAllByText('R$ 18.450,72').length).toBeGreaterThan(0);
    expect(getAllByText('R$ 20.000,00').length).toBeGreaterThan(0);
    expect(getByText('R$ 1.549,28')).toBeTruthy();
    expect(getByText('-R$ 350,00')).toBeTruthy(); // Elite Gym

    // Toggle Privacy via BalanceCard button
    const toggleButton = getByTestId('privacy-toggle-button');
    fireEvent.press(toggleButton);

    // After toggle: literally visible amounts should NOT be present or should be replaced by placeholders
    expect(queryAllByText('R$ 18.450,72').length).toBe(0);
    expect(queryAllByText('R$ 20.000,00').length).toBe(0);
    expect(queryByText('R$ 1.549,28')).toBeNull();
    expect(queryByText('-R$ 350,00')).toBeNull();

    // Ensure privacy blur indicators exist
    expect(getAllByTestId('privacy-blur-overlay').length).toBeGreaterThan(0);
  });

  it('should handle bottom tab bar navigation presses', () => {
    const { getByText } = render(<DashboardScreen />);
    
    // Bottom navigation items should exist
    expect(getByText('Home')).toBeTruthy();
    const cardsTab = getByText('Cards');
    expect(cardsTab).toBeTruthy();

    // Press a tab
    fireEvent.press(cardsTab);
  });

  it('should render the Google Wallet interceptor toggle and mutate the state when pressed', () => {
    const { getByTestId, getByText } = render(<DashboardScreen />);
    
    // Check toggle exists
    expect(getByText('Google Wallet Interceptor')).toBeTruthy();
    
    const toggleButton = getByTestId('wallet-interceptor-toggle');
    expect(toggleButton).toBeTruthy();

    // Toggle on
    fireEvent.press(toggleButton);
    expect(useFinanceStore.getState().enableWalletInterceptor).toBe(true);

    // Toggle off
    fireEvent.press(toggleButton);
    expect(useFinanceStore.getState().enableWalletInterceptor).toBe(false);
  });

  it('should render the DraftReviewModal when a draft is added to the wallet queue', () => {
    // Before draft: Modal is not visible / no draft elements are rendered
    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('NEW TRANSACTION DETECTED')).toBeNull();

    // Add draft directly to store within act() to prevent warnings
    act(() => {
      useFinanceStore.getState().addWalletDraft({
        amount: 49.90,
        date: new Date('2026-05-26'),
        description: 'Starbucks Coffee',
        paymentMethodSuggested: 'credit',
        notes: 'Test draft',
      });
    });

    const { getByText, getByPlaceholderText } = render(<DashboardScreen />);
    
    // Modal header and pre-filled contents should render successfully
    expect(getByText('NEW TRANSACTION DETECTED')).toBeTruthy();
    expect(getByText('R$ 49,90')).toBeTruthy();
    
    const descInput = getByPlaceholderText('Merchant name');
    expect(descInput.props.value).toBe('Starbucks Coffee');
  });
});
