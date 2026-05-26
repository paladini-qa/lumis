import React, { useState } from 'react';
import { Modal, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TransactionModal({ visible, onClose }: TransactionModalProps) {
  const { paymentMethods, categories, addTransaction } = useFinanceStore();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [notes, setNotes] = useState('');

  // Dropdown UI expand states
  const [showPMPicker, setShowPMPicker] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  const selectedPM = paymentMethods.find((p) => p.id === paymentMethodId);
  const selectedCat = categories.find((c) => c.id === categoryId);

  const scaleSubmit = useSharedValue(1);
  const scaleCancel = useSharedValue(1);

  const submitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleSubmit.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCancel.value }],
  }));

  const handleLogTransaction = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description for the transaction.');
      return;
    }

    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
      return;
    }

    try {
      addTransaction({
        userId: 'user-1',
        paymentMethodId,
        categoryId: categoryId || null,
        amount: parsedAmount,
        type,
        date: parsedDate,
        description,
        paymentStatus: 'paid',
        notes: notes.trim() || null,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setNotes('');
      setType('expense');
      setShowPMPicker(false);
      setShowCatPicker(false);
      
      onClose();
    } catch (err: any) {
      Alert.alert('Validation Error', err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(8, 9, 10, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxHeight: '90%',
            backgroundColor: Colors.surface,
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: `${Colors.gold.DEFAULT}33`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
            overflow: 'hidden',
          }}
        >
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {/* Header */}
            <Text
              style={{
                fontFamily: 'Marcellus',
                fontSize: 20,
                fontWeight: '600',
                color: Colors.gold.DEFAULT,
                letterSpacing: 2,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              LOG TRANSACTION
            </Text>

            {/* Income vs Expense Explicit Toggle */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: Colors.backgroundOverlay,
                borderRadius: 14,
                padding: 4,
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => setType('income')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: type === 'income' ? Colors.positive : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Manrope',
                    fontWeight: '700',
                    color: type === 'income' ? Colors.background : Colors.ivory.mute,
                  }}
                >
                  INCOME
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setType('expense')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: type === 'expense' ? Colors.negative : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Manrope',
                    fontWeight: '700',
                    color: type === 'expense' ? Colors.background : Colors.ivory.mute,
                  }}
                >
                  EXPENSE
                </Text>
              </Pressable>
            </View>

            {/* Amount Entry */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Amount (R$)
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor={Colors.ivory.mute}
                keyboardType="numeric"
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              />
            </View>

            {/* Description Entry */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Supermarket, Salary, Coffee"
                placeholderTextColor={Colors.ivory.mute}
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'Manrope',
                  fontSize: 14,
                }}
              />
            </View>

            {/* Date Entry */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.ivory.mute}
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 14,
                }}
              />
            </View>

            {/* Custom Payment Method Dropdown Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Payment Method
              </Text>
              <Pressable
                onPress={() => {
                  setShowPMPicker(!showPMPicker);
                  setShowCatPicker(false);
                }}
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 14 }}>
                  {selectedPM ? `${selectedPM.name} (${selectedPM.type.toUpperCase()})` : 'Select Payment Method'}
                </Text>
                <Text style={{ color: Colors.gold.DEFAULT }}>{showPMPicker ? '▲' : '▼'}</Text>
              </Pressable>

              {showPMPicker && (
                <View
                  style={{
                    backgroundColor: Colors.surfaceMedium,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${Colors.gold.DEFAULT}33`,
                    marginTop: 4,
                    padding: 8,
                  }}
                >
                  {paymentMethods.map((pm) => (
                    <Pressable
                      key={pm.id}
                      onPress={() => {
                        setPaymentMethodId(pm.id || '');
                        setShowPMPicker(false);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: paymentMethodId === pm.id ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 13 }}>
                        {pm.name}
                      </Text>
                      <Text
                        style={{
                          color: pm.type === 'credit' ? Colors.gold.bright : Colors.ivory.mute,
                          fontSize: 10,
                          fontWeight: '600',
                        }}
                      >
                        {pm.type.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Custom Category Dropdown Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Category
              </Text>
              <Pressable
                onPress={() => {
                  setShowCatPicker(!showCatPicker);
                  setShowPMPicker(false);
                }}
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 14 }}>
                  {selectedCat ? selectedCat.name : 'Select Category'}
                </Text>
                <Text style={{ color: Colors.gold.DEFAULT }}>{showCatPicker ? '▲' : '▼'}</Text>
              </Pressable>

              {showCatPicker && (
                <View
                  style={{
                    backgroundColor: Colors.surfaceMedium,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${Colors.gold.DEFAULT}33`,
                    marginTop: 4,
                    padding: 8,
                  }}
                >
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategoryId(cat.id || '');
                        setShowCatPicker(false);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: categoryId === cat.id ? `${Colors.gold.DEFAULT}1A` : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: cat.color,
                          marginRight: 10,
                        }}
                      />
                      <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 13 }}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Notes Entry */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6 }}>
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes"
                placeholderTextColor={Colors.ivory.mute}
                style={{
                  height: 48,
                  backgroundColor: Colors.backgroundOverlay,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'Manrope',
                  fontSize: 14,
                }}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={onClose}
                onPressIn={() => {
                  scaleCancel.value = withSpring(0.93, { damping: 10, stiffness: 150 });
                }}
                onPressOut={() => {
                  scaleCancel.value = withSpring(1.0, { damping: 10, stiffness: 150 });
                }}
                style={{ flex: 1 }}
              >
                <Animated.View
                  style={[
                    {
                      height: 48,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: `${Colors.gold.DEFAULT}33`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                    cancelAnimatedStyle,
                  ]}
                >
                  <Text style={{ color: Colors.gold.DEFAULT, fontFamily: 'Manrope', fontWeight: '700', fontSize: 14 }}>
                    CANCEL
                  </Text>
                </Animated.View>
              </Pressable>

              <Pressable
                onPress={handleLogTransaction}
                onPressIn={() => {
                  scaleSubmit.value = withSpring(0.93, { damping: 10, stiffness: 150 });
                }}
                onPressOut={() => {
                  scaleSubmit.value = withSpring(1.0, { damping: 10, stiffness: 150 });
                }}
                style={{ flex: 1 }}
              >
                <Animated.View
                  style={[
                    {
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: Colors.gold.DEFAULT,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: Colors.gold.deep,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    },
                    submitAnimatedStyle,
                  ]}
                >
                  <Text style={{ color: Colors.background, fontFamily: 'Manrope', fontWeight: '700', fontSize: 14 }}>
                    LOG FLOW
                  </Text>
                </Animated.View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
