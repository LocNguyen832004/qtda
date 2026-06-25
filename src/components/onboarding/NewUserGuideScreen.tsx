import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../../utils/theme';
import { TomatoLogo } from '../brand/TomatoLogo';

interface NewUserGuideScreenProps {
  onStartGuide: () => void;
  onSkipGuide: () => void;
}

const FLOW_STEPS = [
  {
    icon: 'calendar-outline' as const,
    title: 'Lịch học',
    description: 'Nhập lịch tuần này.',
  },
  {
    icon: 'checkbox-outline' as const,
    title: 'To-do',
    description: 'Tạo việc cần làm.',
  },
  {
    icon: 'timer-outline' as const,
    title: 'Pomodoro',
    description: 'Tập trung khi đã có việc rõ ràng.',
  },
];

export const NewUserGuideScreen: React.FC<NewUserGuideScreenProps> = ({
  onStartGuide,
  onSkipGuide,
}) => {
  return (
    <LinearGradient
      colors={['#2F3A4A', '#F04438', '#FFB15C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <TomatoLogo size={92} />

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Lần đầu sử dụng</Text>
          <Text style={styles.title}>Bạn muốn xem hướng dẫn không?</Text>
          <Text style={styles.description}>
            Bắt đầu từ lịch học, rồi đến to-do, cuối cùng mới dùng Pomodoro.
          </Text>
        </View>

        <View style={styles.steps}>
          {FLOW_STEPS.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <Ionicons name={step.icon} size={20} color="#F04438" />
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepKicker}>Bước {index + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={onStartGuide} activeOpacity={0.86}>
            <Text style={styles.primaryButtonText}>Xem hướng dẫn</Text>
            <Ionicons name="arrow-forward" size={18} color="#F04438" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onSkipGuide} activeOpacity={0.72}>
            <Text style={styles.secondaryButtonText}>Bỏ qua hướng dẫn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  copy: {
    gap: SPACING.sm,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 36,
  },
  description: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  steps: {
    gap: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    gap: 2,
  },
  stepKicker: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  stepTitle: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  stepDescription: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: FONT_SIZE.sm,
    lineHeight: 19,
  },
  actions: {
    gap: SPACING.sm,
  },
  primaryButton: {
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  primaryButtonText: {
    color: '#F04438',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
