import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatBRL } from '../theme/currency';
import { Colors } from '../theme/colors';

interface BalanceCardProps {
  value: number;
  isPrivate: boolean;
  onTogglePrivacy: () => void;
}

export function BalanceCard({ value, isPrivate, onTogglePrivacy }: BalanceCardProps) {
  return (
    <View 
      className="p-6 rounded-xl border border-gold bg-surface frost-card-dark"
      style={{
        backgroundColor: Colors.surface,
        borderColor: Colors.gold.DEFAULT,
        borderRadius: 24, // var(--r-lg)
        borderWidth: 1,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-medium text-ivory-mute" style={{ color: Colors.ivory.mute }}>
          Primary Balance
        </Text>
        <TouchableOpacity 
          onPress={onTogglePrivacy} 
          testID="privacy-toggle-button"
          accessibilityLabel="Toggle balance privacy"
        >
          <Text className="text-gold text-lg" style={{ color: Colors.gold.DEFAULT }}>
            {isPrivate ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        {isPrivate ? (
          <View 
            testID="privacy-blur-overlay" 
            className="h-10 bg-ivory-mute opacity-30 rounded"
            style={{ width: 180, backgroundColor: Colors.ivory.mute, opacity: 0.3 }}
          />
        ) : (
          <Text className="text-3xl font-bold text-ivory" style={{ color: Colors.ivory.DEFAULT }}>
            {formatBRL(value)}
          </Text>
        )}
      </View>

      <View className="border-t border-ivory-mute my-3 opacity-20" style={{ borderColor: Colors.ivory.mute }} />

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-ivory-dim" style={{ color: Colors.ivory.dim }}>
          Available: {isPrivate ? '••••••' : formatBRL(value)}
        </Text>
        <Text className="text-xs text-ivory-mute" style={{ color: Colors.ivory.mute }}>
          Updated: Just now
        </Text>
      </View>
    </View>
  );
}
