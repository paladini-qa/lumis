import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFinanceStore } from './src/application/store/useFinanceStore';
import { AuthScreen } from './src/presentation/screens/AuthScreen';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';
import { Colors } from './src/presentation/theme/colors';

export default function App() {
  const { session, loadingAuth, initializeAuth } = useFinanceStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loadingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <DashboardScreen />;
}
