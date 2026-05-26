import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, SafeAreaView, Pressable } from 'react-native';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { BalanceCard } from '../components/BalanceCard';
import { QuickActionsRow } from '../components/QuickActionsRow';
import { BottomTabBar } from '../components/BottomTabBar';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionListFilters } from '../components/TransactionListFilters';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';
import Svg, { Path } from 'react-native-svg';

export function DashboardScreen() {
  const { primaryBalance, isPrivate, togglePrivacy, transactions } = useFinanceStore();
  const [activeTab, setActiveTab] = useState('home');

  // Modal and filters state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 4, 1));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    const next = new Date(selectedMonth.getTime());
    next.setMonth(next.getMonth() - 1);
    setSelectedMonth(next);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedMonth.getTime());
    next.setMonth(next.getMonth() + 1);
    setSelectedMonth(next);
  };

  const formatMonthYear = (date: Date): string => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // 1. Filter by statement month cycle
    const isSameMonth =
      t.statementMonth.getUTCMonth() === selectedMonth.getMonth() &&
      t.statementMonth.getUTCFullYear() === selectedMonth.getFullYear();
    
    if (!isSameMonth) return false;

    // 2. Filter by type
    if (selectedType !== 'all' && t.type !== selectedType) return false;

    // 3. Filter by account payment method
    if (selectedPaymentMethodId !== null && t.paymentMethodId !== selectedPaymentMethodId) return false;

    // 4. Filter by category
    if (selectedCategoryId !== null && t.categoryId !== selectedCategoryId) return false;

    // 5. Filter by description search
    if (searchQuery.trim() !== '') {
      const match = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  // Calculate dynamic monthly aggregates *for the selected statement month*
  const currentMonthTransactions = transactions.filter(
    (t) =>
      t.statementMonth.getUTCMonth() === selectedMonth.getMonth() &&
      t.statementMonth.getUTCFullYear() === selectedMonth.getFullYear()
  );

  const totalIncomes = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const forecast = primaryBalance;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" />
      
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        
        {/* elegant luxury top header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Marcellus',
              fontSize: 24,
              fontWeight: '700',
              color: Colors.gold.DEFAULT,
              letterSpacing: 4,
            }}
          >
            LUMIS
          </Text>
          
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.surface,
              borderWidth: 1.5,
              borderColor: `${Colors.gold.DEFAULT}33`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M13.73 21A2 2 0 0 1 10.27 21"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {/* main scroll content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* balance card */}
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <BalanceCard
              value={primaryBalance}
              isPrivate={isPrivate}
              onTogglePrivacy={togglePrivacy}
            />
          </View>

          {/* quick actions row */}
          <QuickActionsRow
            onLogTransaction={() => setIsModalVisible(true)}
            onTransfer={() => console.log('transfer')}
            onPayCard={() => console.log('pay card')}
            onGoals={() => console.log('goals')}
          />

          {/* Dynamic Month Scroll Selector */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              marginVertical: 12,
            }}
          >
            <Pressable
              onPress={handlePrevMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}1A`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.gold.DEFAULT, fontSize: 14, fontWeight: '700' }}>◀</Text>
            </Pressable>

            <Text
              style={{
                fontFamily: 'Marcellus',
                fontSize: 16,
                fontWeight: '700',
                color: Colors.gold.bright,
                letterSpacing: 2,
              }}
            >
              {formatMonthYear(selectedMonth)}
            </Text>

            <Pressable
              onPress={handleNextMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}1A`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.gold.DEFAULT, fontSize: 14, fontWeight: '700' }}>▶</Text>
            </Pressable>
          </View>

          {/* search and list filters */}
          <TransactionListFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedPaymentMethodId={selectedPaymentMethodId}
            setSelectedPaymentMethodId={setSelectedPaymentMethodId}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
          />

          {/* monthly summary section */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Marcellus',
                fontSize: 18,
                fontWeight: '600',
                color: Colors.ivory.DEFAULT,
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Monthly Summary
            </Text>

            <View
              className="frost-card-dark"
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}1A`, // Subtle outline
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 4 }}>
                    Total Incomes
                  </Text>
                  {isPrivate ? (
                    <View testID="privacy-blur-overlay" style={{ height: 16, width: 80, backgroundColor: Colors.ivory.mute, opacity: 0.3, borderRadius: 4 }} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'JetBrains Mono', color: Colors.positive }}>
                      {formatBRL(totalIncomes)}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 4 }}>
                    Total Expenses
                  </Text>
                  {isPrivate ? (
                    <View style={{ height: 16, width: 80, backgroundColor: Colors.ivory.mute, opacity: 0.3, borderRadius: 4 }} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'JetBrains Mono', color: Colors.negative }}>
                      {formatBRL(totalExpenses)}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 4 }}>
                    Forecast
                  </Text>
                  {isPrivate ? (
                    <View style={{ height: 16, width: 80, backgroundColor: Colors.ivory.mute, opacity: 0.3, borderRadius: 4 }} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', fontFamily: 'JetBrains Mono', color: Colors.gold.bright }}>
                      {formatBRL(forecast)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* recent transactions list */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: 'Marcellus',
                fontSize: 18,
                fontWeight: '600',
                color: Colors.ivory.DEFAULT,
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Recent Transactions
            </Text>

            <View
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}1A`,
                overflow: 'hidden',
              }}
            >
              {filteredTransactions.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: Colors.ivory.mute, fontFamily: 'Manrope', fontSize: 13 }}>
                    No transactions found for this cycle.
                  </Text>
                </View>
              ) : (
                filteredTransactions.slice().reverse().map((t, idx) => {
                  const isExpense = t.type === 'expense';
                  const isTransfer = t.type === 'transfer';
                  
                  let amountColor = Colors.positive;
                  let prefix = '';
                  if (isExpense) {
                    amountColor = Colors.negative;
                    prefix = '-';
                  } else if (isTransfer) {
                    amountColor = Colors.gold.DEFAULT;
                    prefix = '-';
                  }

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 16,
                        borderBottomWidth: idx === filteredTransactions.length - 1 ? 0 : 1,
                        borderBottomColor: `${Colors.ivory.mute}1A`,
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            fontFamily: 'Manrope',
                            color: Colors.ivory.DEFAULT,
                            marginBottom: 4,
                          }}
                        >
                          {t.description}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono',
                            color: Colors.ivory.mute,
                          }}
                        >
                          {t.date.toISOString().slice(0, 10)} • {t.type.toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        {isPrivate ? (
                          <View style={{ height: 16, width: 70, backgroundColor: Colors.ivory.mute, opacity: 0.3, borderRadius: 4 }} />
                        ) : (
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '600',
                              fontFamily: 'JetBrains Mono',
                              color: amountColor,
                            }}
                          >
                            {prefix}{formatBRL(t.amount)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Navigation Bar */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Transaction Creation Modal */}
        <TransactionModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}
