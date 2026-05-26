import React from 'react';
import { View, Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface TabItemProps {
  label: string;
  icon: (color: string) => React.ReactNode;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ label, icon, isActive, onPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10, stiffness: 150 });
  };

  const color = isActive ? Colors.gold.bright : Colors.ivory.mute;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      }}
    >
      <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
        {icon(color)}
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Manrope',
            fontWeight: isActive ? '600' : '400',
            color: color,
            marginTop: 4,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        height: 64,
        borderRadius: 32, // var(--r-xl)
        borderWidth: 1.5,
        borderColor: `${Colors.gold.DEFAULT}22`, // Subtle transparent gold border
        backgroundColor: `${Colors.surface}E6`, // opacity 90%
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <TabItem
        label="Home"
        isActive={activeTab === 'home'}
        onPress={() => onTabChange('home')}
        icon={(color) => (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 22V12H15V22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      />

      <TabItem
        label="Cards"
        isActive={activeTab === 'cards'}
        onPress={() => onTabChange('cards')}
        icon={(color) => (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Rect
              x="2"
              y="5"
              width="20"
              height="14"
              rx="2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M2 10H22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      />

      <TabItem
        label="Goals"
        isActive={activeTab === 'goals'}
        onPress={() => onTabChange('goals')}
        icon={(color) => (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
            <Path
              d="M12 8V12L15 15"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      />

      <TabItem
        label="Analytics"
        isActive={activeTab === 'analytics'}
        onPress={() => onTabChange('analytics')}
        icon={(color) => (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 20V10M12 20V4M6 20V14"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      />

      <TabItem
        label="Lumis AI"
        isActive={activeTab === 'ai'}
        onPress={() => onTabChange('ai')}
        icon={(color) => (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M6.34 17.66L9.17 14.83M14.83 9.17L17.66 6.34"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
          </Svg>
        )}
      />
    </View>
  );
}
