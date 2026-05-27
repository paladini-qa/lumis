import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';

export function AuthScreen() {
  const { signIn, signUp, loadingAuth } = useFinanceStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isRegistering) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      try {
        await signUp(cleanEmail, password);
        Alert.alert('Account Created!', 'Please sign in with your credentials.');
        setIsRegistering(false);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create account.');
      }
    } else {
      try {
        await signIn(cleanEmail, password);
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid email or password.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' }}>
          
          {/* Elegant Luxury Logo Header */}
          <View style={{ marginBottom: 48, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Marcellus', fontSize: 36, fontWeight: '700', color: Colors.gold.DEFAULT, letterSpacing: 8, marginBottom: 8 }}>
              LUMIS
            </Text>
            <Text style={{ fontFamily: 'Manrope', fontSize: 12, color: Colors.ivory.mute, letterSpacing: 3, textTransform: 'uppercase' }}>
              Your Financial Intelligence
            </Text>
          </View>

          {/* Premium Glassmorphic Auth Box */}
          <View 
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: Colors.surface,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: `${Colors.gold.DEFAULT}33`,
              padding: 28,
              shadowColor: Colors.gold.deep,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <Text style={{ fontFamily: 'Marcellus', fontSize: 22, fontWeight: '700', color: Colors.ivory.DEFAULT, marginBottom: 6 }}>
              {isRegistering ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </Text>
            <Text style={{ fontFamily: 'Manrope', fontSize: 13, color: Colors.ivory.dim, marginBottom: 28 }}>
              {isRegistering ? 'Sign up to sync your financials' : 'Sign in to access your dashboard'}
            </Text>

            {/* Inline Error alert */}
            {!!errorMsg && (
              <View 
                style={{
                  backgroundColor: `${Colors.negative}1A`,
                  borderColor: Colors.negative,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontFamily: 'Manrope', fontSize: 12, color: Colors.negative, fontWeight: '600' }}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Email Address
              </Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={`${Colors.ivory.mute}80`}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: Colors.surfaceLight,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  borderWidth: 1.5,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'Manrope',
                  fontSize: 14,
                }}
              />
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: isRegistering ? 20 : 28 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={`${Colors.ivory.mute}80`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: Colors.surfaceLight,
                  borderColor: `${Colors.gold.DEFAULT}1A`,
                  borderWidth: 1.5,
                  paddingHorizontal: 16,
                  color: Colors.ivory.DEFAULT,
                  fontFamily: 'Manrope',
                  fontSize: 14,
                }}
              />
            </View>

            {/* Confirm Password Field (Register Only) */}
            {isRegistering && (
              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Confirm Password
                </Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={`${Colors.ivory.mute}80`}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: Colors.surfaceLight,
                    borderColor: `${Colors.gold.DEFAULT}1A`,
                    borderWidth: 1.5,
                    paddingHorizontal: 16,
                    color: Colors.ivory.DEFAULT,
                    fontFamily: 'Manrope',
                    fontSize: 14,
                  }}
                />
              </View>
            )}

            {/* Submit Button */}
            <Pressable 
              onPress={handleSubmit} 
              disabled={loadingAuth}
              style={({ pressed }) => ({
                height: 48,
                borderRadius: 12,
                backgroundColor: pressed ? Colors.gold.deep : Colors.gold.DEFAULT,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: Colors.gold.deep,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
                opacity: loadingAuth ? 0.7 : 1,
              })}
            >
              {loadingAuth ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Text style={{ color: Colors.background, fontFamily: 'Manrope', fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>
                  {isRegistering ? 'SIGN UP NOW' : 'SIGN IN NOW'}
                </Text>
              )}
            </Pressable>

            {/* Bottom Toggle Link */}
            <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Manrope', fontSize: 13, color: Colors.ivory.mute }}>
                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <Pressable onPress={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}>
                <Text style={{ fontFamily: 'Manrope', fontSize: 13, color: Colors.gold.DEFAULT, fontWeight: '700' }}>
                  {isRegistering ? 'Sign In' : 'Sign Up'}
                </Text>
              </Pressable>
            </View>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
