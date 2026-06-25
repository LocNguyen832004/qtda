import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/lib/supabase';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { TomatoLogo } from '../src/components/brand/TomatoLogo';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Focus tracking state
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | 'confirmPassword' | null>(null);

  // Field-level error validation state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validate = () => {
    let valid = true;
    
    // Clear previous errors
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    // Validate email
    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email.');
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Địa chỉ email không đúng định dạng.');
        valid = false;
      }
    }

    // Validate password
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      valid = false;
    } else if (!isLogin && password.length < 6) {
      setPasswordError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      valid = false;
    }

    // Validate confirm password
    if (!isLogin) {
      if (!confirmPassword) {
        setConfirmPasswordError('Vui lòng xác nhận mật khẩu.');
        valid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Mật khẩu xác nhận không trùng khớp.');
        valid = false;
      }
    }

    return valid;
  };

  async function signInWithEmail() {
    if (!validate()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg === 'Invalid login credentials') {
          msg = 'Email hoặc mật khẩu không chính xác.';
        } else if (msg === 'Email not confirmed') {
          msg = 'Tài khoản chưa được xác nhận qua email. Vui lòng kiểm tra hộp thư.';
        }
        setFeedback(msg);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Không thể đăng nhập.');
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    if (!validate()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg === 'User already registered') {
          msg = 'Email này đã được sử dụng cho tài khoản khác.';
        }
        setFeedback(msg);
        return;
      }

      if (data.session) {
        setFeedback('Đăng ký thành công. Hệ thống đang tự động đăng nhập...');
        return;
      }

      setIsLogin(true);
      setPassword('');
      setConfirmPassword('');
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản đã được tạo. Nếu hệ thống yêu cầu xác nhận email, vui lòng kiểm tra hộp thư để xác thực trước khi đăng nhập.'
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Không thể đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo & Header */}
      <View style={styles.headerContainer}>
        <TomatoLogo size={90} />
        <Text style={styles.appTitle}>Tomato Plan</Text>
        <Text style={styles.appSubtitle}>
          {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Đăng ký tài khoản để bắt đầu rèn luyện'}
        </Text>
      </View>

      {/* Auth Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>

        {feedback && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Địa chỉ Email <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              focusedInput === 'email' && styles.inputWrapperFocused,
              emailError ? styles.inputWrapperError : null,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedInput === 'email' ? COLORS.primary : COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              value={email}
              placeholder="vi_du@example.com"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          {emailError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Mật khẩu <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              focusedInput === 'password' && styles.inputWrapperFocused,
              passwordError ? styles.inputWrapperError : null,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedInput === 'password' ? COLORS.primary : COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              value={password}
              secureTextEntry={!showPassword}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : (
            !isLogin && (
              <Text style={styles.inputHint}>Mật khẩu phải chứa ít nhất 6 ký tự.</Text>
            )
          )}
        </View>

        {/* Confirm Password Input */}
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Xác nhận mật khẩu <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
                confirmPasswordError ? styles.inputWrapperError : null,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedInput === 'confirmPassword' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                value={confirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={isLogin ? signInWithEmail : signUpWithEmail}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký Ngay'}</Text>
              <Ionicons
                name={isLogin ? 'log-in-outline' : 'person-add-outline'}
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Mode Switcher */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsLogin(!isLogin);
            setEmailError(null);
            setPasswordError(null);
            setConfirmPasswordError(null);
            setPassword('');
            setConfirmPassword('');
            setFeedback(null);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.switchButtonText}>
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={[COLORS.primaryDark, COLORS.primary, '#8B85FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardAvoid}
          >
            {formContent}
          </KeyboardAvoidingView>
        ) : (
          formContent
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
    marginBottom: SPACING.md,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.bold,
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackBox: {
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 20,
  },
  feedbackText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm - 1,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.medium,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: FONT_WEIGHT.semibold,
  },
  required: {
    color: COLORS.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  inputHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
    gap: 4,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...SHADOW.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md + 1,
    fontWeight: FONT_WEIGHT.bold,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
