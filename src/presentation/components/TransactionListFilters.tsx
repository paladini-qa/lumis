import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';

interface TransactionListFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedType: 'all' | 'income' | 'expense' | 'transfer';
  setSelectedType: (type: 'all' | 'income' | 'expense' | 'transfer') => void;
  selectedPaymentMethodId: string | null;
  setSelectedPaymentMethodId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

export function TransactionListFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  selectedCategoryId,
  setSelectedCategoryId,
}: TransactionListFiltersProps) {
  const { paymentMethods, categories } = useFinanceStore();

  const [showPMPill, setShowPMPill] = useState(false);
  const [showCatPill, setShowCatPill] = useState(false);

  const selectedPMName = paymentMethods.find((p) => p.id === selectedPaymentMethodId)?.name || 'All Accounts';
  const selectedCatName = categories.find((c) => c.id === selectedCategoryId)?.name || 'All Categories';

  const types: Array<'all' | 'income' | 'expense' | 'transfer'> = ['all', 'income', 'expense', 'transfer'];

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by description..."
          placeholderTextColor={Colors.ivory.mute}
          style={{
            height: 44,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: searchQuery ? Colors.gold.DEFAULT : `${Colors.gold.DEFAULT}1A`,
            paddingHorizontal: 16,
            color: Colors.ivory.DEFAULT,
            fontFamily: 'Manrope',
            fontSize: 14,
          }}
        />
      </View>

      {/* Horizontal Swipeable Type Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}
      >
        {types.map((type) => {
          const isActive = selectedType === type;
          let pillBg = 'transparent';
          let borderCol = `${Colors.gold.DEFAULT}1A`;
          let textCol = Colors.ivory.mute;

          if (isActive) {
            borderCol = Colors.gold.DEFAULT;
            textCol = Colors.background;
            if (type === 'all') pillBg = Colors.gold.DEFAULT;
            else if (type === 'income') pillBg = Colors.positive;
            else if (type === 'expense') pillBg = Colors.negative;
            else if (type === 'transfer') pillBg = Colors.gold.bright;
          }

          return (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: pillBg,
                borderWidth: 1,
                borderColor: borderCol,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Manrope',
                  fontWeight: '700',
                  color: textCol,
                }}
              >
                {type.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Account and Category filter dropdown row */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8 }}>
        {/* Account Filter */}
        <View style={{ flex: 1, position: 'relative' }}>
          <Pressable
            onPress={() => {
              setShowPMPill(!showPMPill);
              setShowCatPill(false);
            }}
            style={{
              height: 38,
              backgroundColor: Colors.surface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: selectedPaymentMethodId ? Colors.gold.DEFAULT : `${Colors.gold.DEFAULT}1A`,
              paddingHorizontal: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12, overflow: 'hidden' }} numberOfLines={1}>
              {selectedPMName}
            </Text>
            <Text style={{ color: Colors.gold.DEFAULT, fontSize: 10 }}>{showPMPill ? '▲' : '▼'}</Text>
          </Pressable>

          {showPMPill && (
            <View
              style={{
                position: 'absolute',
                top: 42,
                left: 0,
                right: 0,
                backgroundColor: Colors.surfaceMedium,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}33`,
                padding: 4,
                zIndex: 100,
              }}
            >
              <Pressable
                onPress={() => {
                  setSelectedPaymentMethodId(null);
                  setShowPMPill(false);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: selectedPaymentMethodId === null ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                }}
              >
                <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12 }}>
                  All Accounts
                </Text>
              </Pressable>
              {paymentMethods.map((pm) => (
                <Pressable
                  key={pm.id}
                  onPress={() => {
                    setSelectedPaymentMethodId(pm.id || null);
                    setShowPMPill(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: selectedPaymentMethodId === pm.id ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                  }}
                >
                  <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12 }}>
                    {pm.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Category Filter */}
        <View style={{ flex: 1, position: 'relative' }}>
          <Pressable
            onPress={() => {
              setShowCatPill(!showCatPill);
              setShowPMPill(false);
            }}
            style={{
              height: 38,
              backgroundColor: Colors.surface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: selectedCategoryId ? Colors.gold.DEFAULT : `${Colors.gold.DEFAULT}1A`,
              paddingHorizontal: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12, overflow: 'hidden' }} numberOfLines={1}>
              {selectedCatName}
            </Text>
            <Text style={{ color: Colors.gold.DEFAULT, fontSize: 10 }}>{showCatPill ? '▲' : '▼'}</Text>
          </Pressable>

          {showCatPill && (
            <View
              style={{
                position: 'absolute',
                top: 42,
                left: 0,
                right: 0,
                backgroundColor: Colors.surfaceMedium,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}33`,
                padding: 4,
                zIndex: 100,
              }}
            >
              <Pressable
                onPress={() => {
                  setSelectedCategoryId(null);
                  setShowCatPill(false);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: selectedCategoryId === null ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                }}
              >
                <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12 }}>
                  All Categories
                </Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategoryId(cat.id || null);
                    setShowCatPill(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: selectedCategoryId === cat.id ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                  }}
                >
                  <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 12 }}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
