import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard Component (TDD - RED)', () => {
  const balance = 18450.72;

  it('should render the currency in strict BRL format (R$ 18.450,72)', () => {
    const { getByText } = render(
      <BalanceCard value={balance} isPrivate={false} onTogglePrivacy={() => {}} />
    );
    
    // Strict BRL: thousands separator is dot (.), decimal separator is comma (,)
    expect(getByText('R$ 18.450,72')).toBeTruthy();
  });

  it('should render blurred/hidden text when isPrivate is true', () => {
    const { queryByText, getByTestId } = render(
      <BalanceCard value={balance} isPrivate={true} onTogglePrivacy={() => {}} />
    );

    // Balance text should NOT be visible literally
    expect(queryByText('R$ 18.450,72')).toBeNull();
    // Privacy state indicator or blurred block should exist
    expect(getByTestId('privacy-blur-overlay')).toBeTruthy();
  });

  it('should trigger onTogglePrivacy when eye button is clicked', () => {
    const onToggleMock = jest.fn();
    const { getByTestId } = render(
      <BalanceCard value={balance} isPrivate={false} onTogglePrivacy={onToggleMock} />
    );

    const toggleButton = getByTestId('privacy-toggle-button');
    fireEvent.press(toggleButton);

    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });
});
