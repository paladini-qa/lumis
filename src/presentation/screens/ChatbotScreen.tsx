import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { useFinanceStore, WalletDraft } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';
import Svg, { Circle, Path } from 'react-native-svg';

interface ChatMessage {
  sender: 'user' | 'lumis';
  text: string;
  image?: string;
  audio?: boolean;
}

export function ChatbotScreen() {
  const { primaryBalance, paymentMethods, goals, categories, addWalletDraft } = useFinanceStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'lumis', text: 'Welcome to Lumis AI! I am your luxury co-pilot. How can I assist you with your checking balance or savings projections today?' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Microphone recording states
  const [isRecording, setIsRecording] = useState(false);
  const micScale = useSharedValue(1);
  const ringScale1 = useSharedValue(1);
  const ringScale2 = useSharedValue(1);
  const ringOpacity1 = useSharedValue(0.4);
  const ringOpacity2 = useSharedValue(0.3);

  const scrollViewRef = useRef<ScrollView>(null);

  // Simulated streaming Gemini text co-pilot
  const generateGeminiResponse = (query: string) => {
    setIsLoading(true);
    
    // Aggregate sanitized co-pilot context
    const activeCards = paymentMethods.filter(p => p.type === 'credit').map(c => `${c.name} (closure: ${c.closureDay})`).join(', ');
    const activeGoals = goals.map(g => `${g.name} (${Math.round((g.currentSavings/g.targetAmount)*100)}% saved)`).join(', ');

    setTimeout(() => {
      let replyText = '';
      const lowercaseQuery = query.toLowerCase();

      if (lowercaseQuery.includes('balance') || lowercaseQuery.includes('spend')) {
        replyText = `Your unified Primary Balance is currently ${formatBRL(primaryBalance)}. You have registered active cards: ${activeCards}. Your total monthly expenses stand within active statement limits.`;
      } else if (lowercaseQuery.includes('goal') || lowercaseQuery.includes('saving')) {
        replyText = `Analyzing your savings tanks: You are tracking ${activeGoals}. I project that you will hit your Emergency Fund deadlines on schedule if active auto-contributions remain enabled.`;
      } else if (lowercaseQuery.includes('buy') || lowercaseQuery.includes('phone') || lowercaseQuery.includes('forecast')) {
        replyText = `If you log an R$ 8.000 expenditure on your Visa card, it will roll over into the next statement month. This keeps your current cash balance at ${formatBRL(primaryBalance)} untouched, but adds a statement commitment due in June.`;
      } else {
        replyText = `Based on your unified ledger, your financial health is stable. I have categorized your standard grocery and leisure transactions automatically. Is there any specific credit statement or split debt you would like to review?`;
      }

      setMessages(prev => [...prev, { sender: 'lumis', text: replyText }]);
      setIsLoading(false);
      
      // Auto scroll
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: txt }]);
    setInputText('');
    generateGeminiResponse(txt);
  };

  // Infinitely repeat expanding golden waves concentric pulse
  const startRecording = () => {
    setIsRecording(true);
    micScale.value = withSpring(1.2, { damping: 10 });
    
    ringScale1.value = 1;
    ringOpacity1.value = 0.5;
    ringScale1.value = withRepeat(withTiming(2.2, { duration: 1200 }), -1, false);
    ringOpacity1.value = withRepeat(withTiming(0, { duration: 1200 }), -1, false);

    ringScale2.value = 1;
    ringOpacity2.value = 0.4;
    ringScale2.value = withRepeat(withTiming(3.2, { duration: 1600 }), -1, false);
    ringOpacity2.value = withRepeat(withTiming(0, { duration: 1600 }), -1, false);
  };

  const stopRecordingAndTriggerSim = () => {
    setIsRecording(false);
    micScale.value = withSpring(1.0, { damping: 10 });
    ringScale1.value = withSpring(1.0);
    ringScale2.value = withSpring(1.0);
    ringOpacity1.value = 0;
    ringOpacity2.value = 0;

    // Simulate voice command scan
    simulateVoiceSmartInput();
  };

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale1.value }],
    opacity: ringOpacity1.value,
  }));

  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale2.value }],
    opacity: ringOpacity2.value,
  }));

  // Smart Input Simulators
  const simulateReceiptSmartInput = () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'user', text: 'Scanning Receipt image...', image: 'receipt' }]);
    
    setTimeout(() => {
      setIsLoading(false);
      // Push Draft to Zustand Drafts Queue
      addWalletDraft({
        amount: 29.90,
        date: new Date(),
        description: 'Starbucks Premium',
        paymentMethodSuggested: 'credit',
        notes: 'Multimodal Receipt Scan draft',
      });
      setMessages(prev => [...prev, { sender: 'lumis', text: 'Successfully parsed Starbucks receipt! I have opened a glassmorphic Draft Review Card for your confirmation.' }]);
      Alert.alert('Draft Created', 'Starbucks draft parsed! Tap Home/Notification to view slide-up card.');
    }, 1500);
  };

  const simulateVoiceSmartInput = () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'user', text: '"Spent R$ 120 on fuel at Shell gas station using debit"', audio: true }]);
    
    setTimeout(() => {
      setIsLoading(false);
      addWalletDraft({
        amount: 120.00,
        date: new Date(),
        description: 'Shell Gas Station',
        paymentMethodSuggested: 'debit',
        notes: 'Multimodal Voice Audio draft',
      });
      setMessages(prev => [...prev, { sender: 'lumis', text: 'Successfully parsed voice note! Created a draft for Shell Gas Station. Tap Home to confirm.' }]);
      Alert.alert('Draft Created', 'Shell Gas draft parsed! Tap Home/Notification to view slide-up card.');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Lumis AI Co-Pilot</Text>
      <Text style={styles.sectionSubtitle}>Multimodal Gemini co-pilot with security gates</Text>

      {/* Developer Simulation Bar */}
      <View style={styles.devSimulationPanel}>
        <Text style={styles.devTitle}>DEV SMART INPUT SIMULATOR</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={simulateReceiptSmartInput} style={styles.devBtn}>
            <Text style={styles.devBtnText}>📸 SCAN RECEIPT</Text>
          </Pressable>
          <Pressable onPress={simulateVoiceSmartInput} style={styles.devBtn}>
            <Text style={styles.devBtnText}>🎙️ VOICE CMD</Text>
          </Pressable>
        </View>
      </View>

      {/* Chat Messages Log */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ flex: 1, marginVertical: 12 }}
      >
        <View style={{ gap: 16 }}>
          {messages.map((m, idx) => {
            const isLumis = m.sender === 'lumis';
            return (
              <View
                key={idx}
                style={[
                  styles.msgBubble,
                  isLumis ? styles.msgLumis : styles.msgUser,
                ]}
              >
                {m.image && (
                  <View style={styles.receiptPreview}>
                    <Text style={{ color: '#000', fontSize: 18 }}>📄</Text>
                    <Text style={{ color: '#000', fontSize: 10, fontFamily: 'Manrope', fontWeight: 'bold' }}>RECEIPT.JPG</Text>
                  </View>
                )}
                {m.audio && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text>🔊</Text>
                    <Text style={{ color: Colors.gold.bright, fontSize: 11, fontFamily: 'JetBrains Mono' }}>Voice Memo.m4a</Text>
                  </View>
                )}
                <Text
                  style={{
                    color: isLumis ? Colors.ivory.DEFAULT : Colors.background,
                    fontFamily: 'Manrope',
                    fontSize: 13,
                  }}
                >
                  {m.text}
                </Text>
              </View>
            );
          })}

          {isLoading && (
            <View style={[styles.msgBubble, styles.msgLumis, { width: 60, justifyContent: 'center' }]}>
              <ActivityIndicator color={Colors.gold.DEFAULT} size="small" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mic Waves overlay during recording */}
      {isRecording && (
        <View style={styles.micWavesOverlay}>
          <Animated.View style={[styles.expandingRing, ringStyle2]} />
          <Animated.View style={[styles.expandingRing, ringStyle1]} />
          <Animated.View style={[styles.micPulseButton, micStyle]}>
            <Text style={{ fontSize: 24 }}>🎙️</Text>
          </Animated.View>
          <Text style={styles.micRecordingText}>Recording on-device voice note...</Text>
          <Pressable onPress={stopRecordingAndTriggerSim} style={styles.stopMicBtn}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>STOP & PARSE</Text>
          </Pressable>
        </View>
      )}

      {/* Interactive Footer Controls */}
      <View style={styles.chatFooter}>
        <TextInput
          placeholder="Ask about forecast, goal progress..."
          value={inputText}
          onChangeText={setInputText}
          placeholderTextColor={Colors.ivory.mute}
          style={styles.chatInput}
        />

        {/* Send Button */}
        {inputText.trim() ? (
          <Pressable onPress={handleSendText} style={styles.sendButton}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={Colors.background} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        ) : (
          /* Mic Recording Trigger Button */
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecordingAndTriggerSim}
            style={styles.micTriggerBtn}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke={Colors.background} strokeWidth="2" strokeLinecap="round" />
              <Path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" stroke={Colors.background} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 16,
  },
  devSimulationPanel: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}33`,
    padding: 12,
    gap: 8,
  },
  devTitle: {
    fontFamily: 'JetBrains Mono',
    fontSize: 9,
    fontWeight: '700',
    color: Colors.gold.DEFAULT,
    letterSpacing: 1,
  },
  devBtn: {
    flex: 1,
    backgroundColor: `${Colors.gold.DEFAULT}1A`,
    borderColor: `${Colors.gold.DEFAULT}33`,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devBtnText: {
    color: Colors.gold.bright,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  msgLumis: {
    backgroundColor: Colors.surface,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  msgUser: {
    backgroundColor: Colors.gold.DEFAULT,
    alignSelf: 'flex-end',
  },
  chatFooter: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    height: 52,
    flexDirection: 'row',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderColor: `${Colors.gold.DEFAULT}33`,
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 16,
    color: Colors.ivory.DEFAULT,
    fontFamily: 'Manrope',
    fontSize: 13,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micTriggerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gold.bright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPreview: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#e6c687',
  },
  micWavesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 9, 10, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  micPulseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  expandingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: Colors.gold.bright,
    borderWidth: 2,
    zIndex: 1,
  },
  micRecordingText: {
    color: Colors.ivory.DEFAULT,
    fontFamily: 'Manrope',
    fontSize: 14,
    marginTop: 32,
  },
  stopMicBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.negative,
    borderRadius: 18,
  },
});
