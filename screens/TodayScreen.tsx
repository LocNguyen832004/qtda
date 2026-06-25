import React, { useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore, useFocusStore, useScheduleStore } from '../src/store';
import { TaskCard } from '../src/components/tasks/TaskCard';
import { ScheduleCard } from '../src/components/timetable/ScheduleCard';
import { FadeInView } from '../src/components/ui/FadeInView';
import { TutorialTooltip } from '../src/components/ui/TutorialTooltip';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { getTodayDayOfWeek, getDayFullName, todayString } from '../src/utils/dateUtils';

export default function TodayScreen({ navigation }: any) {
  const { tasks, toggleTaskDone } = useTaskStore();
  const { totalPoints, tutorialActiveTab, tutorialActiveStep } = useFocusStore();
  const { slots } = useScheduleStore();

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (tutorialActiveTab === 'Today' && tutorialActiveStep !== null) {
      setTimeout(() => {
        if (tutorialActiveStep === 1) {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        } else if (tutorialActiveStep === 2) {
          scrollRef.current?.scrollTo({ y: 150, animated: true });
        }
      }, 100);
    }
  }, [tutorialActiveTab, tutorialActiveStep]);
  
  const today = getTodayDayOfWeek();
  const todayStr = todayString();

  const todaySlots = useMemo(
    () => slots.filter((s) => s.dayOfWeek === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, today]
  );

  const urgentTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'done' && (t.dueDate <= todayStr || t.priority === 'high')).slice(0, 5),
    [tasks, todayStr]
  );

  const doneCount = tasks.filter((t) => t.completedAt?.startsWith(todayStr)).length;
  const todoCount = tasks.filter((t) => t.status !== 'done').length;

  const now = new Date();
  const greetHour = now.getHours();
  const greeting = greetHour < 12 ? 'Chào buổi sáng' : greetHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ position: 'relative' }}>
        {tutorialActiveTab === 'Today' && tutorialActiveStep !== null && (
          <View pointerEvents="none" style={styles.tutorialBackdrop} />
        )}
        {/* Header gradient */}
        <LinearGradient
          colors={['#6C63FF', '#8B85FF']}
          style={[
            styles.header,
            (tutorialActiveTab === 'Today' && tutorialActiveStep === 1) && { zIndex: 1001 }
          ]}
        >
          <View style={[
            styles.headerTop,
            (tutorialActiveTab === 'Today' && tutorialActiveStep === 1) && { zIndex: 1001, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.md, padding: 8 }
          ]}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.dateText}>{getDayFullName(today)}, {now.getDate()}/{now.getMonth() + 1}/{now.getFullYear()}</Text>
            </View>
            <View style={styles.pointsBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>{totalPoints}</Text>
            </View>
          </View>

          {/* Tooltip Step 1 */}
          {tutorialActiveTab === 'Today' && tutorialActiveStep === 1 && (
            <View style={{ zIndex: 1001, marginTop: 8 }}>
              <TutorialTooltip
                step={1}
                totalSteps={2}
                title="Điểm thưởng"
                description="Hoàn thành phiên học để nhận điểm."
                onNext={() => useFocusStore.getState().nextTutorialStep()}
                onSkip={() => useFocusStore.getState().skipTutorial()}
                arrowPosition="top"
              />
            </View>
          )}

          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{doneCount}</Text>
              <Text style={styles.summaryLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{todoCount}</Text>
              <Text style={styles.summaryLabel}>Chưa làm</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{todaySlots.length}</Text>
              <Text style={styles.summaryLabel}>Tiết học</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[
          styles.body,
          (tutorialActiveTab === 'Today' && tutorialActiveStep === 2) && { zIndex: 1001 }
        ]}>
          {/* Agenda & Tasks Box */}
          <View style={[
            (tutorialActiveTab === 'Today' && tutorialActiveStep === 2) && { zIndex: 1001, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 12, ...SHADOW.lg }
          ]}>
            {/* Tooltip Step 2 */}
            {tutorialActiveTab === 'Today' && tutorialActiveStep === 2 && (
              <View style={{ marginBottom: 12 }}>
                <TutorialTooltip
                  step={2}
                  totalSteps={2}
                  title="Hôm nay"
                  description="Xem lịch và việc cần làm trong ngày."
                  onNext={() => useFocusStore.getState().nextTutorialStep()}
                  onPrev={() => useFocusStore.getState().prevTutorialStep()}
                  onSkip={() => useFocusStore.getState().skipTutorial()}
                  arrowPosition="top"
                />
              </View>
            )}
            {/* Today's Schedule */}
            {todaySlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitleStandalone}>📅 Lịch học hôm nay</Text>
                {todaySlots.map((slot, index) => (
                  <FadeInView key={slot.id} delay={index * 60}>
                    <ScheduleCard slot={slot} />
                  </FadeInView>
                ))}
              </View>
            )}

            {todaySlots.length === 0 && (
              <View style={styles.emptySchedule}>
                <Ionicons name="cafe-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Hôm nay không có tiết học 🎉</Text>
              </View>
            )}

            {/* Urgent Tasks */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Cần làm hôm nay</Text>
                <TouchableOpacity
                  style={styles.sectionAddButton}
                  onPress={() => navigation?.navigate('Tasks')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              {urgentTasks.length === 0 ? (
                <TouchableOpacity
                  style={styles.emptyTask}
                  onPress={() => tasks.length === 0 && navigation?.navigate('Tasks')}
                  activeOpacity={tasks.length === 0 ? 0.8 : 1}
                >
                  <Ionicons
                    name={tasks.length === 0 ? 'add-circle-outline' : 'checkmark-circle-outline'}
                    size={28}
                    color={tasks.length === 0 ? COLORS.primary : COLORS.success}
                  />
                  <Text style={styles.emptyText}>
                    {tasks.length === 0
                      ? 'Chưa có công việc nào. Bấm + để tạo ở tab Việc.'
                      : 'Tất cả công việc hôm nay đã xong!'}
                  </Text>
                </TouchableOpacity>
              ) : (
                urgentTasks.map((task, index) => (
                  <FadeInView key={task.id} delay={index * 60 + 100}>
                    <TaskCard task={task} onToggle={toggleTaskDone} />
                  </FadeInView>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    paddingTop: 20,
    paddingHorizontal: SPACING.md,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: '#fff' },
  dateText: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  pointsText: { color: '#fff', fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    marginTop: 20,
    padding: 16,
  },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  summaryNum: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: '#fff' },
  summaryLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  body: { padding: SPACING.md, paddingTop: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  sectionTitleStandalone: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sectionAddButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  emptySchedule: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyTask: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  emptyText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  onboardingCard: {
    padding: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.surface,
    ...SHADOW.md,
    marginBottom: SPACING.lg,
  },
  onboardingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  onboardingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  onboardingDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  stepList: {
    gap: 14,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  stepDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  btnOnboardingCTA: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  btnOnboardingCTAText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  tutorialBackdrop: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(10, 11, 22, 0.72)',
    zIndex: 1000,
  },
});
