import React, { useState, useEffect } from 'react';
import { Modal, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';

export function DraftReviewModal() {
  const { 
    walletDrafts, 
    removeWalletDraft, 
    addTransaction, 
    paymentMethods, 
    categories 
  } = useFinanceStore();

  const activeDraft = walletDrafts[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');

  // Sync state with active draft
  useEffect(() => {
    if (activeDraft) {
      setDescription(activeDraft.description);
      setAmount(activeDraft.amount.toString().replace('.', ','));
      setNotes(activeDraft.notes || 'Parsed from Google Wallet');
      
      // Auto-categorize based on simple substring match
      const descLower = activeDraft.description.toLowerCase();
      let matchedCat = categories[0]?.id || '';
      if (descLower.includes('uber') || descLower.includes('transport') || descLower.includes('taxi')) {
        const transport = categories.find(c => c.name.toLowerCase() === 'transport');
        if (transport) matchedCat = transport.id;
      } else if (descLower.includes('starbucks') || descLower.includes('cafe') || descLower.includes('restaurant') || descLower.includes('food')) {
        const leisure = categories.find(c => c.name.toLowerCase() === 'leisure');
        if (leisure) matchedCat = leisure.id;
      } else if (descLower.includes('grocery') || descLower.includes('supermarket') || descLower.includes('pão de açúcar')) {
        const groceries = categories.find(c => c.name.toLowerCase() === 'groceries');
        if (groceries) matchedCat = groceries.id;
      }
      setCategoryId(matchedCat);

      // Select default suggested payment method
      if (activeDraft.paymentMethodSuggested === 'credit') {
        const creditPM = paymentMethods.find(p => p.type === 'credit');
        setPaymentMethodId(creditPM?.id || paymentMethods[0]?.id || '');
      } else {
        const debitPM = paymentMethods.find(p => p.type === 'debit');
        setPaymentMethodId(debitPM?.id || paymentMethods[0]?.id || '');
      }
    }
  }, [activeDraft, categories, paymentMethods]);

  const scaleSubmit = useSharedValue(1);
  const scaleCancel = useSharedValue(1);

  const submitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleSubmit.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCancel.value }],
  }));

  if (!activeDraft) return null;

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a merchant or description.');
      return;
    }

    try {
      addTransaction({
        userId: 'user-1',
        paymentMethodId,
        categoryId: categoryId || null,
        amount: parsedAmount,
        type: 'expense',
        date: activeDraft.date || new Date(),
        description,
        paymentStatus: 'paid',
        notes: notes.trim() || null,
      });

      // Remove the successfully parsed draft from the queue
      removeWalletDraft(activeDraft.id);
    } catch (err: any) {
      Alert.alert('Validation Error', err.message);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Draft',
      'Are you sure you want to discard this wallet transaction draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => removeWalletDraft(activeDraft.id)
        }
      ]
    );
  };

  return (
    <Modal visible={!!activeDraft} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(8, 9, 10, 0.85)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1.5,
            borderColor: `${Colors.gold.DEFAULT}33`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 10,
            maxHeight: '85%',
          }}
        >
          <View style={{ width: '100%', alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 5, borderRadius: 2.5, backgroundColor: `${Colors.ivory.mute}33` }} />
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 }}>
            <Text
              style={{
                fontFamily: 'Marcellus',
                fontSize: 18,
                fontWeight: '600',
                color: Colors.gold.DEFAULT,
                letterSpacing: 2,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              NEW TRANSACTION DETECTED
            </Text>
            
            <Text
              style={{
                fontFamily: 'Manrope',
                fontSize: 12,
                color: Colors.ivory.mute,
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Interception from Google Wallet (Real-Time Notification)
            </Text>

            {/* Quick Summary Banner */}
            <View
              style={{
                backgroundColor: `${Colors.gold.DEFAULT}0A`,
                borderWidth: 1,
                borderColor: `${Colors.gold.DEFAULT}26`,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 12, fontFamily: 'Manrope', color: Colors.gold.bright, letterSpacing: 1, marginBottom: 4 }}>
                DETECTED AMOUNT
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', fontFamily: 'JetBrains Mono', color: Colors.gold.DEFAULT }}>
                {formatBRL(activeDraft.amount)}
              </Text>
            </View>

            {/* Merchant / Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6, letterSpacing: 0.5 }}>
                MERCHANT / DESCRIPTION
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Merchant name"
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
                  fontWeight: '600',
                }}
              />
            </View>

            {/* Amount Adjust */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6, letterSpacing: 0.5 }}>
                AMOUNT (R$)
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
                  fontSize: 15,
                  fontWeight: '600',
                }}
              />
            </View>

            {/* Suggested Payment Method / Selector */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6, letterSpacing: 0.5 }}>
                PAYMENT METHOD
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {paymentMethods.map((pm) => {
                  const isSelected = pm.id === paymentMethodId;
                  return (
                    <Pressable
                      key={pm.id}
                      onPress={() => setPaymentMethodId(pm.id || '')}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected ? pm.color : Colors.backgroundOverlay,
                        borderWidth: 1,
                        borderColor: isSelected ? pm.color : `${Colors.gold.DEFAULT}1A`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Manrope',
                          fontWeight: '700',
                          color: isSelected ? Colors.background : Colors.ivory.DEFAULT,
                        }}
                      >
                        {pm.name} ({pm.type.toUpperCase()})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category Selector */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 6, letterSpacing: 0.5 }}>
                CATEGORY
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => {
                  const isSelected = cat.id === categoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        backgroundColor: isSelected ? cat.color : Colors.backgroundOverlay,
                        borderWidth: 1,
                        borderColor: isSelected ? cat.color : `${Colors.gold.DEFAULT}1A`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Manrope',
                          fontWeight: '600',
                          color: isSelected ? Colors.background : Colors.ivory.DEFAULT,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Animated.View style={[{ flex: 1 }, cancelAnimatedStyle]}>
                <Pressable
                  onPressIn={() => { scaleCancel.value = withSpring(0.95, { damping: 10, stiffness: 150 }); }}
                  onPressOut={() => { scaleCancel.value = withSpring(1.0, { damping: 10, stiffness: 150 }); }}
                  onPress={handleDiscard}
                  style={{
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.negative,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Manrope', fontWeight: '700', color: Colors.negative }}>
                    DISCARD
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[{ flex: 2 }, submitAnimatedStyle]}>
                <Pressable
                  onPressIn={() => { scaleSubmit.value = withSpring(0.95, { damping: 10, stiffness: 150 }); }}
                  onPressOut={() => { scaleSubmit.value = withSpring(1.0, { damping: 10, stiffness: 150 }); }}
                  onPress={handleConfirm}
                  style={{
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: Colors.gold.DEFAULT,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Manrope', fontWeight: '700', color: Colors.background }}>
                    CONFIRM & SAVE
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
