import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Custom simple interpolate helper to be bulletproof under Jest mock environments
const customInterpolate = (value: number, inputRange: number[], outputRange: number[]) => {
  'worklet';
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  if (value <= inputMin) return outputMin;
  if (value >= inputMax) return outputMax;
  return outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin);
};

// Custom reusable component for 3D flip card mockup
interface DigitalCardMockupProps {
  name: string;
  type: 'credit' | 'debit';
  color: string;
  closureDay?: number;
  dueDay?: number;
  limit?: number;
  balance: number;
  cardStyle: 'noir' | 'gold' | 'platinum';
  onUpdateSettings?: (closure: number, due: number, limit: number) => void;
}

function DigitalCardMockup({
  name,
  type,
  color,
  closureDay = 10,
  dueDay = 20,
  limit = 15000,
  balance,
  cardStyle,
  onUpdateSettings,
}: DigitalCardMockupProps) {
  const isFlipped = useSharedValue(0); // 0 = Front, 1 = Back

  const [editClosure, setEditClosure] = useState(closureDay.toString());
  const [editDue, setEditDue] = useState(dueDay.toString());
  const [editLimit, setEditLimit] = useState(limit.toString());

  const flip = () => {
    isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, { damping: 14, stiffness: 90 });
  };

  const frontStyle = useAnimatedStyle(() => {
    const spin = customInterpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: isFlipped.value > 0.5 ? 0 : 1,
      zIndex: isFlipped.value > 0.5 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const spin = customInterpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: isFlipped.value > 0.5 ? 1 : 0,
      zIndex: isFlipped.value > 0.5 ? 1 : 0,
    };
  });

  // Pick premium gradient background based on template style
  const getCardBackground = () => {
    switch (cardStyle) {
      case 'noir':
        return ['#141517', '#08090A'];
      case 'gold':
        return ['#F4D99A', '#C9A961'];
      case 'platinum':
        return ['#E5E9F0', '#A3BE8C'];
      default:
        return [color, color];
    }
  };

  const textPrimary = cardStyle === 'gold' ? '#08090A' : '#F5EFE0';
  const textSecondary = cardStyle === 'gold' ? 'rgba(8, 9, 10, 0.65)' : '#C7C0AD';
  const accentGold = cardStyle === 'gold' ? '#08090A' : '#E6C687';

  const cardBg = getCardBackground();

  const handleSave = () => {
    const c = parseInt(editClosure, 10);
    const d = parseInt(editDue, 10);
    const l = parseFloat(editLimit);

    if (isNaN(c) || c < 1 || c > 31 || isNaN(d) || d < 1 || d > 31 || isNaN(l) || l < 0) {
      Alert.alert('Invalid Settings', 'Please check that closure and due days are between 1 and 31.');
      return;
    }

    if (onUpdateSettings) {
      onUpdateSettings(c, d, l);
    }
    flip();
  };

  return (
    <Pressable onPress={flip} style={{ width: '100%', height: 200, marginBottom: 20 }}>
      {/* Front View */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg[1],
            borderColor: cardStyle === 'gold' ? 'rgba(230, 198, 135, 0.2)' : `${Colors.gold.DEFAULT}33`,
            borderWidth: 1.5,
          },
          frontStyle,
        ]}
      >
        {/* Brand Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Marcellus', fontSize: 18, fontWeight: '700', color: textPrimary, letterSpacing: 2 }}>
            LUMIS
          </Text>
          <View style={{ width: 32, height: 20, borderRadius: 4, backgroundColor: accentGold, opacity: 0.8 }} />
        </View>

        {/* Chip and Type */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <View style={{ width: 36, height: 26, borderRadius: 6, backgroundColor: cardStyle === 'gold' ? '#0c0d1033' : '#ffffff22', borderWidth: 1, borderColor: accentGold }} />
          <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: '600', color: textSecondary }}>
            {type.toUpperCase()} CARD
          </Text>
        </View>

        {/* Statement Balance */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: 'Manrope', fontSize: 10, color: textSecondary }}>
            ACTIVE STATEMENT
          </Text>
          <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: '700', color: textPrimary }}>
            {formatBRL(balance)}
          </Text>
        </View>

        {/* Card Footer details */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto' }}>
          <View>
            <Text style={{ fontFamily: 'Manrope', fontSize: 9, color: textSecondary }}>CARDHOLDER</Text>
            <Text style={{ fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', color: textPrimary }}>{name.toUpperCase()}</Text>
          </View>
          {type === 'credit' && (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ fontFamily: 'Manrope', fontSize: 9, color: textSecondary }}>CLOSURE</Text>
                <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: '600', color: textPrimary }}>{closureDay}</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'Manrope', fontSize: 9, color: textSecondary }}>DUE</Text>
                <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: '600', color: textPrimary }}>{dueDay}</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Back View (Settings Panel) */}
      <Animated.View
        style={[
          styles.cardContainer,
          styles.cardBack,
          {
            backgroundColor: Colors.surface,
            borderColor: `${Colors.gold.DEFAULT}4D`,
            borderWidth: 1.5,
          },
          backStyle,
        ]}
      >
        <Text style={{ fontFamily: 'Marcellus', fontSize: 14, fontWeight: '600', color: Colors.gold.DEFAULT, marginBottom: 12, textAlign: 'center' }}>
          CARD CONFIGURATION
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {type === 'credit' ? (
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope', fontSize: 11, color: Colors.ivory.mute }}>Closure Day</Text>
                <TextInput
                  value={editClosure}
                  onChangeText={setEditClosure}
                  keyboardType="numeric"
                  style={styles.backInput}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope', fontSize: 11, color: Colors.ivory.mute }}>Due Day</Text>
                <TextInput
                  value={editDue}
                  onChangeText={setEditDue}
                  keyboardType="numeric"
                  style={styles.backInput}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope', fontSize: 11, color: Colors.ivory.mute }}>Credit Limit (R$)</Text>
                <TextInput
                  value={editLimit}
                  onChangeText={setEditLimit}
                  keyboardType="numeric"
                  style={[styles.backInput, { width: 80 }]}
                />
              </View>
            </View>
          ) : (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, paddingVertical: 12 }}>
              <Text style={{ color: Colors.ivory.mute, fontFamily: 'Manrope', fontSize: 12, textAlign: 'center' }}>
                Debit draws directly from your unified liquid cash balance. No statement days required.
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            style={{
              marginTop: 16,
              backgroundColor: Colors.gold.DEFAULT,
              borderRadius: 8,
              paddingVertical: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: Colors.background, fontFamily: 'Manrope', fontWeight: '700', fontSize: 12 }}>
              SAVE CHANGES
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </Pressable>
  );
}

export function PaymentMethodsScreen() {
  const {
    paymentMethods,
    categories,
    transactions,
    autoCategoryRules,
    tags,
    addPaymentMethod,
    deletePaymentMethod,
    addCategory,
    deleteCategory,
    addTag,
    addAutoCategoryRule,
    deleteAutoCategoryRule,
  } = useFinanceStore();

  // Selected card slide index template styles
  const cardTemplates: ('noir' | 'gold' | 'platinum')[] = ['noir', 'gold', 'platinum'];

  // Add Card states
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [closureDay, setClosureDay] = useState('10');
  const [dueDay, setDueDay] = useState('20');
  const [cardColor, setCardColor] = useState('#E6C687');

  // Categories Color HSL State
  const [categoryName, setCategoryName] = useState('');
  const [hue, setHue] = useState(45); // Hue range [0, 360]
  const [catIcon, setCatIcon] = useState('cart-outline');

  // Tag States
  const [tagName, setTagName] = useState('');

  // Rules Engine states
  const [ruleSubstring, setRuleSubstring] = useState('');
  const [ruleCatId, setRuleCatId] = useState(categories[0]?.id || '');

  // Calculate active statement total for a payment card
  const getCardActiveStatement = (pmId: string) => {
    return transactions
      .filter((t) => t.paymentMethodId === pmId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddCardSubmit = () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name.');
      return;
    }
    const cDay = parseInt(closureDay, 10);
    const dDay = parseInt(dueDay, 10);

    addPaymentMethod({
      userId: 'user-1',
      name: cardName,
      type: cardType,
      closureDay: cardType === 'credit' ? cDay : undefined,
      dueDay: cardType === 'credit' ? dDay : undefined,
      icon: 'card-outline',
      color: cardColor,
    });

    setCardName('');
    setShowAddCard(false);
  };

  const handleAddCategorySubmit = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    // Compose HSL color string dynamically based on hue slider
    const hslColor = `hsl(${hue}, 70%, 75%)`;

    addCategory({
      userId: 'user-1',
      name: categoryName,
      color: hslColor,
      icon: catIcon,
    });

    setCategoryName('');
  };

  const handleAddTagSubmit = () => {
    if (!tagName.trim()) return;
    addTag(tagName.trim());
    setTagName('');
  };

  const handleAddRuleSubmit = () => {
    if (!ruleSubstring.trim()) return;
    addAutoCategoryRule(ruleSubstring.trim().toLowerCase(), ruleCatId);
    setRuleSubstring('');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
    >
      <Text style={styles.sectionTitle}>Digital Card Wallet</Text>
      <Text style={styles.sectionSubtitle}>Tap card to flip for billing settings</Text>

      {/* Wallet Carousel */}
      {paymentMethods.map((pm, idx) => (
        <DigitalCardMockup
          key={pm.id}
          name={pm.name}
          type={pm.type}
          color={pm.color}
          closureDay={pm.closureDay ?? undefined}
          dueDay={pm.dueDay ?? undefined}
          balance={getCardActiveStatement(pm.id || '')}
          cardStyle={cardTemplates[idx % cardTemplates.length]}
          onUpdateSettings={(c, d, l) => {
            // Store action to update PM config directly in Zustand
            pm.closureDay = c;
            pm.dueDay = d;
          }}
        />
      ))}

      {/* Add Payment Method Button */}
      <Pressable onPress={() => setShowAddCard(!showAddCard)} style={styles.addButton}>
        <Text style={styles.addButtonText}>
          {showAddCard ? 'Cancel Add Card' : '+ Add Payment Card'}
        </Text>
      </Pressable>

      {showAddCard && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Card Name (e.g. Visa Reserve)"
            value={cardName}
            onChangeText={setCardName}
            placeholderTextColor={Colors.ivory.mute}
            style={styles.input}
          />

          <View style={styles.toggleRow}>
            <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 13 }}>Card Type</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setCardType('credit')}
                style={[styles.smallToggle, cardType === 'credit' && styles.smallToggleActive]}
              >
                <Text style={[styles.smallToggleText, cardType === 'credit' && styles.smallToggleTextActive]}>CREDIT</Text>
              </Pressable>
              <Pressable
                onPress={() => setCardType('debit')}
                style={[styles.smallToggle, cardType === 'debit' && styles.smallToggleActive]}
              >
                <Text style={[styles.smallToggleText, cardType === 'debit' && styles.smallToggleTextActive]}>DEBIT</Text>
              </Pressable>
            </View>
          </View>

          {cardType === 'credit' && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                placeholder="Closure Day (1-31)"
                value={closureDay}
                onChangeText={setClosureDay}
                keyboardType="numeric"
                placeholderTextColor={Colors.ivory.mute}
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                placeholder="Due Day (1-31)"
                value={dueDay}
                onChangeText={setDueDay}
                keyboardType="numeric"
                placeholderTextColor={Colors.ivory.mute}
                style={[styles.input, { flex: 1 }]}
              />
            </View>
          )}

          <Pressable onPress={handleAddCardSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>CONFIRM CREATE</Text>
          </Pressable>
        </View>
      )}

      {/* Premium Category Customizer HSL Slider */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>HSL Category Customizer</Text>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Category Name"
          value={categoryName}
          onChangeText={setCategoryName}
          placeholderTextColor={Colors.ivory.mute}
          style={styles.input}
        />

        {/* Color Preview Swatch */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `hsl(${hue}, 70%, 75%)`,
              borderWidth: 2,
              borderColor: Colors.gold.DEFAULT,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ivory.DEFAULT, fontSize: 12, fontFamily: 'Manrope', marginBottom: 4 }}>
              Hue Swatch: {hue}° (HSL Color picker)
            </Text>
            {/* Simulation HSL Hue slider using horizontal press ranges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setHue(h)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: hue === h ? Colors.gold.DEFAULT : '#333',
                    backgroundColor: `hsl(${h}, 70%, 75%)`,
                  }}
                >
                  <Text style={{ fontSize: 9, color: '#000', fontWeight: 'bold' }}>{h}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <TextInput
          placeholder="Icon Name (e.g. cart-outline, briefcase-outline)"
          value={catIcon}
          onChangeText={setCatIcon}
          placeholderTextColor={Colors.ivory.mute}
          style={styles.input}
        />

        <Pressable onPress={handleAddCategorySubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>ADD NEW CATEGORY</Text>
        </Pressable>
      </View>

      {/* Substring Auto-Categorization Engine Rules */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Auto-Categorization Rules</Text>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Match description substring (e.g. 'uber')"
          value={ruleSubstring}
          onChangeText={setRuleSubstring}
          placeholderTextColor={Colors.ivory.mute}
          style={styles.input}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 8 }}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setRuleCatId(cat.id)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: ruleCatId === cat.id ? Colors.gold.DEFAULT : 'transparent',
                backgroundColor: Colors.surface,
              }}
            >
              <Text style={{ color: Colors.ivory.DEFAULT, fontSize: 11, fontFamily: 'Manrope' }}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable onPress={handleAddRuleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>CREATE MATCH RULE</Text>
        </Pressable>
      </View>

      {/* Rules list */}
      <View style={{ marginTop: 12, gap: 8 }}>
        {autoCategoryRules.map((rule) => {
          const matchingCat = categories.find((c) => c.id === rule.categoryId);
          return (
            <View
              key={rule.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: Colors.surface,
                borderRadius: 10,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 13 }}>
                If description includes <Text style={{ color: Colors.gold.bright, fontWeight: '700' }}>"{rule.substring}"</Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={{ color: matchingCat?.color || Colors.ivory.mute, fontSize: 11, fontWeight: 'bold' }}>
                  → {matchingCat?.name || 'Category'}
                </Text>
                <Pressable onPress={() => deleteAutoCategoryRule(rule.id)}>
                  <Text style={{ color: Colors.negative, fontSize: 12 }}>✕</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Tags Manager */}
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Tags Manager</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        <TextInput
          placeholder="New tag (e.g. #trip2026)"
          value={tagName}
          onChangeText={setTagName}
          placeholderTextColor={Colors.ivory.mute}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <Pressable onPress={handleAddTagSubmit} style={{ backgroundColor: Colors.gold.DEFAULT, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
          <Text style={{ color: Colors.background, fontFamily: 'Manrope', fontWeight: '700', fontSize: 12 }}>ADD</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag) => (
          <View
            key={tag.id}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: `${Colors.gold.DEFAULT}1A`,
              borderWidth: 1,
              borderColor: `${Colors.gold.DEFAULT}33`,
            }}
          >
            <Text style={{ color: Colors.gold.bright, fontFamily: 'JetBrains Mono', fontSize: 11 }}>
              #{tag.name}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backInput: {
    width: 60,
    height: 32,
    backgroundColor: Colors.backgroundOverlay,
    borderColor: `${Colors.gold.DEFAULT}33`,
    borderWidth: 1,
    borderRadius: 6,
    color: Colors.ivory.DEFAULT,
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    textAlign: 'center',
    padding: 0,
  },
  sectionTitle: {
    fontFamily: 'Marcellus',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gold.DEFAULT,
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.ivory.mute,
    marginBottom: 20,
  },
  addButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${Colors.gold.DEFAULT}33`,
    backgroundColor: `${Colors.surface}99`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: Colors.gold.DEFAULT,
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    height: 44,
    backgroundColor: Colors.backgroundOverlay,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    paddingHorizontal: 12,
    color: Colors.ivory.DEFAULT,
    fontFamily: 'Manrope',
    fontSize: 13,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.backgroundOverlay,
  },
  smallToggleActive: {
    backgroundColor: Colors.gold.DEFAULT,
  },
  smallToggleText: {
    color: Colors.ivory.mute,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
  },
  smallToggleTextActive: {
    color: Colors.background,
  },
  submitButton: {
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: Colors.background,
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 12,
  },
});
