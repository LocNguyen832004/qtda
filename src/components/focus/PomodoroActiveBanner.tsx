import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore } from '../../store';
import { useSubjectStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../utils/theme';
import { formatCountdown } from '../../utils/dateUtils';

interface PomodoroActiveBannerProps {
  /** Khi bấm banner → mở lại FocusLockScreen */
  onPress: () => void;
  /** Thời gian còn lại (giây) — cập nhật từ FocusScreen */
  timeLeft: number;
  /** Timer đang chạy hay tạm dừng */
  isRunning: boolean;
  /** Mode hiện tại */
  mode: 'pomodoro' | 'short_break' | 'long_break';
}

const MODE_ICON: Record<string, string> = {
  pomodoro: '🍅',
  short_break: '☕',
  long_break: '🌿',
};

const MODE_LABEL: Record<string, string> = {
  pomodoro: 'Đang Pomodoro',
  short_break: 'Nghỉ ngắn',
  long_break: 'Nghỉ dài',
};

export function PomodoroActiveBanner({
  onPress,
  timeLeft,
  isRunning,
  mode,
}: PomodoroActiveBannerProps) {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const { activeSession } = useFocusStore();
  const { subjects } = useSubjectStore();

  const subject = subjects.find((s) => s.id === activeSession?.subjectId);

  // Slide in
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 70,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse dot when running
  useEffect(() => {
    if (pulseRef.current) {
      pulseRef.current.stop();
      pulseRef.current = null;
    }
    if (isRunning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseRef.current = loop;
      loop.start();
    } else {
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }).start();
    }
    return () => { pulseRef.current?.stop(); };
  }, [isRunning]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        style={[styles.banner, { borderLeftColor: subject?.color ?? COLORS.primary }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Left: pulsing dot + mode emoji */}
        <View style={styles.left}>
          <View style={styles.dotWrapper}>
            <Animated.View
              style={[
                styles.dotRing,
                { borderColor: subject?.color ?? COLORS.primary, transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={[styles.dot, { backgroundColor: subject?.color ?? COLORS.primary }]} />
          </View>
          <Text style={styles.modeEmoji}>{MODE_ICON[mode]}</Text>
          <View style={styles.textBlock}>
            <Text style={styles.modeLabel}>{MODE_LABEL[mode]}</Text>
            {subject && (
              <Text style={[styles.subjectLabel, { color: subject.color }]} numberOfLines={1}>
                {subject.shortName}
              </Text>
            )}
          </View>
        </View>

        {/* Right: countdown + arrow */}
        <View style={styles.right}>
          <Text style={[styles.countdown, isRunning && { color: subject?.color ?? COLORS.primary }]}>
            {formatCountdown(timeLeft)}
          </Text>
          <Ionicons
            name={isRunning ? 'timer-outline' : 'pause-circle-outline'}
            size={14}
            color={COLORS.textMuted}
            style={{ marginLeft: 4 }}
          />
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 2 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 12,
    right: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dotWrapper: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    opacity: 0.4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  modeEmoji: {
    fontSize: 18,
  },
  textBlock: {
    flex: 1,
    gap: 1,
  },
  modeLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  subjectLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  countdown: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
});
