import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TomatoLogo } from '../brand/TomatoLogo';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStartScreenProps {
  onStart: () => void;
}

export const OnboardingStartScreen: React.FC<OnboardingStartScreenProps> = ({ onStart }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#8B85FF']}
        style={styles.gradient}
      >
        {/* Background decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        <View style={styles.content}>
          {/* Logo / Icon Area */}
          <View style={styles.logoContainer}>
            <TomatoLogo size={120} />
            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
            </View>
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={styles.appTitle}>Chào mừng bạn đến với Tomato Plan</Text>
            <Text style={styles.description}>
              Hệ thống hỗ trợ bạn lên kế hoạch và quản lý thời gian học tập hiệu quả.
            </Text>
          </View>

          {/* Button CTA */}
          <TouchableOpacity
            style={styles.btnStart}
            onPress={onStart}
            activeOpacity={0.85}
          >
            <Text style={styles.btnStartText}>Đăng nhập</Text>
            <Ionicons name="log-in-outline" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as object,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  circle1: {
    width: 250,
    height: 250,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -80,
    left: -80,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: SCREEN_HEIGHT * 0.75,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    position: 'relative',
    marginTop: 20,
    ...SHADOW.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: SPACING.lg,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.xs,
    marginTop: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: FONT_WEIGHT.medium,
  },
  btnStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    width: '100%',
    ...SHADOW.md,
  },
  btnStartText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
