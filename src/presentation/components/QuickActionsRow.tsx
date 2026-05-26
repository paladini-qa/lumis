import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface QuickActionItemProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

function QuickActionItem({ label, icon, onPress }: QuickActionItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 10, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10, stiffness: 150 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="items-center mr-6"
      style={{ alignItems: 'center', marginRight: 24 }}
    >
      <Animated.View
        className="w-14 h-14 rounded-full border border-gold justify-center items-center mb-2"
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 1.5,
            borderColor: Colors.gold.DEFAULT,
            backgroundColor: Colors.backgroundOverlay,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.gold.deep,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          },
          animatedStyle,
        ]}
      >
        {icon}
      </Animated.View>
      <Text
        className="text-xs font-medium text-ivory text-center"
        style={{
          color: Colors.ivory.DEFAULT,
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Manrope',
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface QuickActionsRowProps {
  onLogTransaction?: () => void;
  onTransfer?: () => void;
  onPayCard?: () => void;
  onGoals?: () => void;
}

export function QuickActionsRow({
  onLogTransaction = () => {},
  onTransfer = () => {},
  onPayCard = () => {},
  onGoals = () => {},
}: QuickActionsRowProps) {
  return (
    <View style={{ marginVertical: 20 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <QuickActionItem
          label="Log Trans."
          onPress={onLogTransaction}
          icon={
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 5V19M5 12H19"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
        />

        <QuickActionItem
          label="Transfer"
          onPress={onTransfer}
          icon={
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M17 1H21V5M21 1L13 9M7 23H3V19M3 23L11 15"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
        />

        <QuickActionItem
          label="Pay Card"
          onPress={onPayCard}
          icon={
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M1 10H23"
                stroke={Colors.gold.DEFAULT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
        />

        <QuickActionItem
          label="Savings Goals"
          onPress={onGoals}
          icon={
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke={Colors.gold.DEFAULT} strokeWidth="2" />
              <Circle cx="12" cy="12" r="6" stroke={Colors.gold.DEFAULT} strokeWidth="2" />
              <Circle cx="12" cy="12" r="2" stroke={Colors.gold.DEFAULT} strokeWidth="2" />
            </Svg>
          }
        />
      </ScrollView>
    </View>
  );
}
