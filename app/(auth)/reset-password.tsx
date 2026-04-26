import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const OTP_LENGTH = 6;

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { resetPassword, isLoading, authError, clearError, resetEmail } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [step]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const otpArray = value.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + otpArray.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerifyOtp = () => {
    clearError();
    const otpString = otp.join('');
    if (otpString.length !== 6 || !/^\d+$/.test(otpString)) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('password');
  };

  const handleResetPassword = async () => {
    clearError();
    const otpString = otp.join('');
    const success = await resetPassword(otpString, newPassword, confirmPassword);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)/login');
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isPasswordValid = newPassword.length >= 6 && confirmPassword.length >= 6;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#2563eb', '#6366f1']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable
          onPress={() => step === 'password' ? setStep('otp') : router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons 
              name={step === 'otp' ? 'shield-checkmark' : 'lock-closed'} 
              size={32} 
              color="#2563eb" 
            />
          </View>
          <Text style={styles.title}>
            {step === 'otp' ? 'Verify Code' : 'Reset Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'otp' 
              ? `We sent a code to ${resetEmail || 'your email'}`
              : 'Enter your new password'
            }
          </Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step === 'otp' ? (
              <>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: focusedIndex === index ? colors.primary : colors.border,
                          color: colors.text,
                        },
                        digit && { borderColor: colors.primary, backgroundColor: colors.infoLight },
                      ]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {authError && (
                  <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {authError}
                    </Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title="Verify Code"
                    onPress={handleVerifyOtp}
                    disabled={!isOtpComplete}
                    fullWidth
                    size="lg"
                  />
                </View>

                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                    Didn't receive the code?{' '}
                  </Text>
                  <Pressable onPress={handleResend}>
                    <Text style={[styles.resendLink, { color: colors.primary }]}>
                      Resend
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="lock-closed-outline"
                  isPassword
                  autoFocus
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="lock-closed-outline"
                  isPassword
                />

                {authError && (
                  <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {authError}
                    </Text>
                  </View>
                )}

                <View style={styles.passwordRequirements}>
                  <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                    Password must contain:
                  </Text>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={16} 
                      color={newPassword.length >= 6 ? colors.success : colors.textTertiary} 
                    />
                    <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                      At least 6 characters
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons 
                      name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={16} 
                      color={newPassword === confirmPassword && newPassword.length > 0 ? colors.success : colors.textTertiary} 
                    />
                    <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                      Passwords match
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Reset Password"
                    onPress={handleResetPassword}
                    isLoading={isLoading}
                    disabled={!isPasswordValid}
                    fullWidth
                    size="lg"
                  />
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  content: {},
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 15,
  },
  resendLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  passwordRequirements: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
  },
});