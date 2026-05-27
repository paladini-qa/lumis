import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';
import Svg, { Circle, Path, ClipPath, Defs } from 'react-native-svg';

// Custom circular wave progress animation
interface SavingsTankProps {
  progress: number; // between 0 and 1
  color: string;
}

function SavingsTank({ progress, color }: SavingsTankProps) {
  // Animate the wave movement horizontally infinitely
  const waveAnim = useSharedValue(0);

  React.useEffect(() => {
    waveAnim.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedWaveStyle = useAnimatedStyle(() => {
    // Generate horizontal shifting wave offset
    const shiftX = interpolate(waveAnim.value, [0, 1], [0, -40]);
    // Wave height maps to progress (1 = full tank, 0 = empty tank)
    const heightY = interpolate(progress, [0, 1], [140, 10]);

    return {
      transform: [{ translateX: shiftX }],
      top: withSpring(heightY, { damping: 15, stiffness: 80 }),
    };
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.tankOuter}>
      {/* Border & Circle Clip */}
      <Svg width="120" height="120" viewBox="0 0 120 120" style={styles.tankSvg}>
        <Defs>
          <ClipPath id="circle-clip">
            <Circle cx="60" cy="60" r="54" />
          </ClipPath>
        </Defs>

        {/* Outer Shiny Ring */}
        <Circle cx="60" cy="60" r="57" stroke={`${Colors.gold.DEFAULT}44`} strokeWidth="3" fill="none" />
        
        {/* Background Inner Space */}
        <Circle cx="60" cy="60" r="54" fill={`${Colors.backgroundOverlay}`} />

        {/* Floating animated wave group */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 240, // double width to shift seamlessly
              height: 120,
            },
            animatedWaveStyle,
          ]}
        >
          {/* SVG Wave Shape */}
          <Svg width="240" height="120" viewBox="0 0 240 120" fill="none">
            <Path
              d="M 0,40 C 30,35 60,45 90,40 C 120,35 150,45 180,40 C 210,35 240,45 270,40 V 120 H 0 Z"
              fill={`${color}CC`} // soft opacity
            />
          </Svg>
        </Animated.View>

        {/* Text readout */}
        <Circle cx="60" cy="60" r="54" fill="none" clipPath="url(#circle-clip)" />
      </Svg>

      <View style={styles.readoutOverlay}>
        <Text style={styles.readoutPercent}>{percentage}%</Text>
        <Text style={styles.readoutLabel}>SAVED</Text>
      </View>
    </View>
  );
}

export function GoalsScreen() {
  const { goals, primaryBalance, addGoal, contributeToGoal } = useFinanceStore();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadlineStr, setDeadlineStr] = useState('2026-12-31');
  const [goalColor, setGoalColor] = useState('#E6C687');

  // Contribution slider modal
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  const handleAddGoal = () => {
    const target = parseFloat(targetAmount.replace(',', '.'));
    if (!goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount.');
      return;
    }

    addGoal({
      userId: 'user-1',
      name: goalName,
      targetAmount: target,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      color: goalColor,
      icon: 'shield-outline',
    });

    setGoalName('');
    setTargetAmount('');
    setShowAddGoal(false);
  };

  const handleContributeSubmit = () => {
    const amt = parseFloat(contribAmount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount.');
      return;
    }
    if (amt > primaryBalance) {
      Alert.alert('Insufficient Funds', 'You cannot contribute more than your available liquid checking balance.');
      return;
    }

    if (selectedGoalId) {
      contributeToGoal(selectedGoalId, amt);
      setContribAmount('');
      setSelectedGoalId(null);
      Alert.alert('Success', 'Successfully contributed to savings goal!');
    }
  };

  const activeGoalForContrib = goals.find((g) => g.id === selectedGoalId);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
    >
      <Text style={styles.sectionTitle}>Savings Goals</Text>
      <Text style={styles.sectionSubtitle}>Circular fluid wave "Savings Tank" projection</Text>

      {/* List of active savings goals */}
      <View style={{ gap: 20 }}>
        {goals.map((goal) => {
          const progress = Math.min(goal.currentSavings / goal.targetAmount, 1);
          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                {/* Fluid Wave Tank */}
                <SavingsTank progress={progress} color={goal.color} />

                {/* Info Text panel */}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.goalTitle}>{goal.name}</Text>
                  <Text style={styles.goalTarget}>
                    Target: <Text style={{ color: Colors.gold.bright, fontFamily: 'JetBrains Mono' }}>{formatBRL(goal.targetAmount)}</Text>
                  </Text>
                  <Text style={styles.goalSaved}>
                    Saved: <Text style={{ color: Colors.positive, fontFamily: 'JetBrains Mono' }}>{formatBRL(goal.currentSavings)}</Text>
                  </Text>
                  {goal.deadline && (
                    <Text style={styles.goalDeadline}>
                      Target Date: {new Date(goal.deadline).toISOString().slice(0, 10)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Contribute Action Row */}
              <Pressable
                onPress={() => setSelectedGoalId(goal.id)}
                style={styles.contributeBtn}
              >
                <Text style={styles.contributeBtnText}>CONTRIBUTE FUNDS</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Manual Contribution Dialog Drawer */}
      {selectedGoalId && activeGoalForContrib && (
        <View style={[styles.formContainer, { marginTop: 24 }]}>
          <Text style={styles.formTitle}>Contribute to {activeGoalForContrib.name}</Text>
          <Text style={styles.balanceCaption}>
            Checking Balance Available: {formatBRL(primaryBalance)}
          </Text>

          <TextInput
            placeholder="Amount to contribute (R$)"
            value={contribAmount}
            onChangeText={setContribAmount}
            keyboardType="numeric"
            placeholderTextColor={Colors.ivory.mute}
            style={styles.input}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Pressable onPress={() => setSelectedGoalId(null)} style={[styles.submitButton, { flex: 1, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: `${Colors.gold.DEFAULT}33` }]}>
              <Text style={[styles.submitButtonText, { color: Colors.gold.DEFAULT }]}>CANCEL</Text>
            </Pressable>
            <Pressable onPress={handleContributeSubmit} style={[styles.submitButton, { flex: 1 }]}>
              <Text style={styles.submitButtonText}>CONFIRM SPLIT</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Add New Goal Toggle Panel */}
      <Pressable onPress={() => setShowAddGoal(!showAddGoal)} style={[styles.addButton, { marginTop: 24 }]}>
        <Text style={styles.addButtonText}>
          {showAddGoal ? 'Cancel Add Goal' : '+ Create Savings Goal'}
        </Text>
      </Pressable>

      {showAddGoal && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Goal Title (e.g. Dream Car, Emergency)"
            value={goalName}
            onChangeText={setGoalName}
            placeholderTextColor={Colors.ivory.mute}
            style={styles.input}
          />
          <TextInput
            placeholder="Target Savings (R$)"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholderTextColor={Colors.ivory.mute}
            style={styles.input}
          />
          <TextInput
            placeholder="Target Deadline (YYYY-MM-DD)"
            value={deadlineStr}
            onChangeText={setDeadlineStr}
            placeholderTextColor={Colors.ivory.mute}
            style={styles.input}
          />

          {/* Quick Color Swatch selection */}
          <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8, justifyContent: 'center' }}>
            {['#E6C687', '#B9D4A3', '#E09B87', '#93C5FD', '#F5EFE0'].map((color) => (
              <Pressable
                key={color}
                onPress={() => setGoalColor(color)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: color,
                  borderWidth: 2,
                  borderColor: goalColor === color ? Colors.gold.DEFAULT : 'transparent',
                }}
              />
            ))}
          </View>

          <Pressable onPress={handleAddGoal} style={[styles.submitButton, { marginTop: 12 }]}>
            <Text style={styles.submitButtonText}>CREATE GOAL</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    padding: 16,
  },
  goalTitle: {
    fontFamily: 'Marcellus',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ivory.DEFAULT,
    letterSpacing: 1,
  },
  goalTarget: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.ivory.mute,
  },
  goalSaved: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.ivory.mute,
  },
  goalDeadline: {
    fontFamily: 'JetBrains Mono',
    fontSize: 10,
    color: Colors.ivory.mute,
    marginTop: 4,
  },
  contributeBtn: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}33`,
    backgroundColor: `${Colors.surfaceMedium}66`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  contributeBtnText: {
    color: Colors.gold.bright,
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
  formTitle: {
    fontFamily: 'Marcellus',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold.DEFAULT,
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceCaption: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.ivory.mute,
    marginBottom: 12,
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
  submitButton: {
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.background,
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 12,
  },
  tankOuter: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tankSvg: {
    position: 'absolute',
  },
  readoutOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  readoutPercent: {
    fontFamily: 'JetBrains Mono',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold.bright,
  },
  readoutLabel: {
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '700',
    color: Colors.ivory.mute,
    letterSpacing: 1,
  },
});
