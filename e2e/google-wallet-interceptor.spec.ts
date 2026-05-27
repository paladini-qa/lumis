import { test, expect } from '@playwright/test';

test.describe('Lumis Google Wallet Interceptor E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Open the Lumis web dashboard
    await page.goto('/');
    
    // Wait for the app main elements to load
    await expect(page.getByText('LUMIS', { exact: true })).toBeVisible();
    
    // Reset store before starting
    await page.evaluate(() => {
      window.useFinanceStore.getState().reset();
    });
  });

  test('should render and toggle the Google Wallet Interceptor switcher', async ({ page }) => {
    const toggleLabel = page.getByText('Google Wallet Interceptor');
    await expect(toggleLabel).toBeVisible();

    const toggleButton = page.getByTestId('wallet-interceptor-toggle');
    await expect(toggleButton).toBeVisible();

    // Verify initially disabled (Zustand state is false)
    let interceptorEnabled = await page.evaluate(() => {
      return window.useFinanceStore.getState().enableWalletInterceptor;
    });
    expect(interceptorEnabled).toBe(false);

    // Toggle ON
    await toggleButton.click();
    
    interceptorEnabled = await page.evaluate(() => {
      return window.useFinanceStore.getState().enableWalletInterceptor;
    });
    expect(interceptorEnabled).toBe(true);

    // Toggle OFF
    await toggleButton.click();
    
    interceptorEnabled = await page.evaluate(() => {
      return window.useFinanceStore.getState().enableWalletInterceptor;
    });
    expect(interceptorEnabled).toBe(false);
  });

  test('should spawn DraftReviewModal on background transaction match and allow confirmation', async ({ page }) => {
    // Verify Draft modal is initially not visible
    const modalHeader = page.getByText('NEW TRANSACTION DETECTED');
    await expect(modalHeader).not.toBeVisible();

    // Emulate background native intercept event adding a draft to the Zustand queue
    await page.evaluate(() => {
      window.useFinanceStore.getState().addWalletDraft({
        amount: 29.90,
        date: new Date('2026-05-26'),
        description: 'Starbucks Coffee',
        paymentMethodSuggested: 'credit',
        notes: 'E2E Intercept Match',
      });
    });

    // The modal should dynamically open and become visible
    await expect(modalHeader).toBeVisible();
    await expect(page.getByText('R$ 29,90')).toBeVisible();

    // Pre-filled inputs verification
    const merchantInput = page.getByPlaceholder('Merchant name');
    await expect(merchantInput).toHaveValue('Starbucks Coffee');

    const amountInput = page.getByPlaceholder('0,00');
    await expect(amountInput).toHaveValue('29,9');

    // Confirm and Save the transaction
    const confirmButton = page.getByText('CONFIRM & SAVE');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // The modal drawer should disappear
    await expect(modalHeader).not.toBeVisible();

    // Check that the transaction was logged and is rendered in the Recent Transactions list
    const loggedTx = page.getByText('Starbucks Coffee');
    await expect(loggedTx).toBeVisible();

    // Check that the drafts queue is now empty
    const draftsLength = await page.evaluate(() => {
      return window.useFinanceStore.getState().walletDrafts.length;
    });
    expect(draftsLength).toBe(0);
  });
});

// Declare window interface extensions
declare global {
  interface Window {
    useFinanceStore: any;
  }
}
