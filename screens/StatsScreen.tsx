import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore, useSubjectStore, useTaskStore } from '../src/store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { getWeekDates, dateToString, getDayName } from '../src/utils/dateUtils';
const MODE_EMOJI: Record<string, string> = {
  pomodoro: '⏱️',
  short_break: '☕',
  long_break: '🥤',
};

const MODE_LABEL: Record<string, string> = {
  pomodoro: 'Phiên học',
  short_break: 'Nghỉ ngắn',
  long_break: 'Nghỉ dài',
};

const REASON_LABEL: Record<string, string> = {
  tab_switch: 'Chuyển màn hình',
  back_button: 'Bấm quay lại',
  app_background: 'Thoát ứng dụng',
};

const formatTime = (ts: string) => {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatElapsed = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}p${sec}s`;
};

export default function StatsScreen() {
  const { sessions, totalPoints, abandonLogs } = useFocusStore();
  const { subjects } = useSubjectStore();
  const { tasks } = useTaskStore();

  const weekDates = useMemo(() => getWeekDates(), []);
  const weekDateStrings = weekDates.map(dateToString);

  // Minutes per day this week
  const dailyMinutes = useMemo(() =>
    weekDates.map((date) => {
      const ds = dateToString(date);
      return sessions
        .filter((s) => s.date === ds && s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
    }), [sessions, weekDates]);

  const maxMinutes = Math.max(...dailyMinutes, 1);
  const totalWeekMinutes = dailyMinutes.reduce((a, b) => a + b, 0);

  // Minutes per subject
  const subjectMinutes = useMemo(() =>
    subjects.map((sub) => ({
      subject: sub,
      minutes: sessions.filter((s) => s.subjectId === sub.id && s.completed).reduce((sum, s) => sum + s.durationMinutes, 0),
    })).filter((x) => x.minutes > 0).sort((a, b) => b.minutes - a.minutes),
    [sessions, subjects]
  );
  const totalSubjectMin = subjectMinutes.reduce((a, b) => a + b.minutes, 0) || 1;

  // Streak
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = dateToString(d);
      const hasFocus = sessions.some((s) => s.date === ds && s.completed);
      if (hasFocus) streak++;
      else break;
    }
    return streak;
  }, [sessions]);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalPomodoros = sessions.filter((s) => s.completed && s.sessionType === 'pomodoro').length;
  const totalFocusMinutes = useMemo(() =>
    sessions
      .filter((s) => s.completed && s.sessionType === 'pomodoro')
      .reduce((sum, s) => sum + s.durationMinutes, 0),
    [sessions]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Thống Kê</Text>

        {/* Summary cards */}
        <View style={styles.summaryGrid}>
          <LinearGradient colors={['#6C63FF', '#8B85FF']} style={styles.mainCard}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.mainNum}>{totalPoints}</Text>
            <Text style={styles.mainLabel}>Tổng điểm</Text>
          </LinearGradient>

          <View style={styles.miniCards}>
            <View style={styles.miniCard}>
              <Text style={[styles.miniNum, { color: COLORS.danger }]}>🔥 {streakDays}</Text>
              <Text style={styles.miniLabel}>ngày streak</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={[styles.miniNum, { color: COLORS.success }]}>✅ {completedTasks}</Text>
              <Text style={styles.miniLabel}>task xong</Text>
            </View>
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⏱ Giờ học tuần này</Text>
            <Text style={styles.cardValue}>{Math.round(totalWeekMinutes / 60 * 10) / 10}h</Text>
          </View>
          <View style={styles.chart}>
            {dailyMinutes.map((min, i) => {
              const barH = Math.max(4, (min / maxMinutes) * 100);
              const date = weekDates[i];
              const isToday = dateToString(date) === dateToString(new Date());
              return (
                <View key={i} style={styles.chartCol}>
                  {min > 0 && (
                    <Text style={styles.chartLabel}>{min}p</Text>
                  )}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        { height: barH, backgroundColor: isToday ? COLORS.primary : COLORS.primaryLight + '60' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, isToday && { color: COLORS.primary, fontWeight: FONT_WEIGHT.bold }]}>
                    {getDayName(date.getDay())}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pomodoro count */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phiên học hoàn thành</Text>
          <Text style={styles.pomodoroTotal}>{totalPomodoros} phiên học = {totalFocusMinutes} phút tập trung</Text>
        </View>

        {/* Subject breakdown */}
        {subjectMinutes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Phân bổ môn học</Text>
            <View style={styles.subjectList}>
              {subjectMinutes.map(({ subject, minutes }) => {
                const pct = minutes / totalSubjectMin;
                return (
                  <View key={subject.id} style={styles.subjectRow}>
                    <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
                    <Text style={styles.subjectName} numberOfLines={1}>{subject.shortName}</Text>
                    <View style={styles.barWrap}>
                      <View style={[styles.subjectBar, { width: `${pct * 100}%`, backgroundColor: subject.color }]} />
                    </View>
                    <Text style={styles.subjectMin}>{minutes}p</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {/* Abandon history */}
        {abandonLogs.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🟠 Lịch sử bỏ dở</Text>
              <Text style={styles.cardValue}>{abandonLogs.length}</Text>
            </View>
            <View style={styles.abandonList}>
              {abandonLogs.slice(0, 10).map((log) => {
                const sub = subjects.find((s) => s.id === log.subjectId);
                const pct = Math.round((log.elapsedSeconds / log.totalSeconds) * 100);
                return (
                  <View key={log.id} style={styles.abandonRow}>
                    {/* Color bar */}
                    <View style={[styles.abandonAccent, { backgroundColor: sub?.color ?? COLORS.border }]} />
                    <View style={styles.abandonContent}>
                      <View style={styles.abandonTop}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.abandonMode}>{MODE_EMOJI[log.mode]} {MODE_LABEL[log.mode]}</Text>
                          <Text style={styles.penaltyText}>-5đ</Text>
                        </View>
                        <Text style={styles.abandonTime}>{formatTime(log.timestamp)}</Text>
                      </View>
                      <View style={styles.abandonMid}>
                        {sub && (
                          <View style={[styles.subjectBadge, { backgroundColor: sub.color + '20' }]}>
                            <View style={[styles.badgeDot, { backgroundColor: sub.color }]} />
                            <Text style={[styles.badgeText, { color: sub.color }]}>{sub.shortName}</Text>
                          </View>
                        )}
                        <Text style={styles.abandonReason}>{REASON_LABEL[log.reason]}</Text>
                      </View>
                      {/* Progress bar */}
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${pct}%` as any,
                              backgroundColor: sub?.color ?? COLORS.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.abandonStat}>
                        Đã học {formatElapsed(log.elapsedSeconds)} / {formatElapsed(log.totalSeconds)} ({pct}%)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {abandonLogs.length > 10 && (
              <Text style={styles.moreText}>+{abandonLogs.length - 10} lần khác…</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: 40 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  summaryGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  mainCard: { flex: 1.2, borderRadius: RADIUS.xl, padding: 20, alignItems: 'center', gap: 4, ...SHADOW.md },
  mainNum: { fontSize: 36, fontWeight: FONT_WEIGHT.bold, color: '#fff' },
  mainLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)' },
  miniCards: { flex: 1, gap: SPACING.sm },
  miniCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  miniNum: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  miniLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardValue: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 6 },
  chartCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartLabel: { fontSize: 9, color: COLORS.textMuted },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: COLORS.borderLight, borderRadius: RADIUS.sm, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: RADIUS.sm },
  dayLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  pomodoroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 8 },
  tomatoDot: { width: 20, height: 20, borderRadius: 10 },
  moreText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, alignSelf: 'center' },
  pomodoroTotal: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  subjectList: { gap: 10, marginTop: 4 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectColor: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { width: 42, fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  barWrap: { flex: 1, height: 8, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  subjectBar: { height: '100%', borderRadius: RADIUS.full },
  subjectMin: { width: 36, fontSize: FONT_SIZE.xs, color: COLORS.textMuted, textAlign: 'right' },
  // Abandon styles
  abandonList: { gap: 10, marginTop: 4 },
  abandonRow: { flexDirection: 'row', borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  abandonAccent: { width: 4 },
  abandonContent: { flex: 1, padding: 10, gap: 5 },
  abandonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  abandonMode: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  penaltyText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  abandonTime: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  abandonMid: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
  abandonReason: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  progressTrack: { height: 4, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  abandonStat: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
