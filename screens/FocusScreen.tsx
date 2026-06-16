import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Alert, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubjectStore, useFocusStore, useTaskStore } from '../src/store';
import { ModalContainer } from '../src/components/ui/ModalContainer';
import { FocusLockScreen } from '../src/components/focus/FocusLockScreen';
import { TutorialTooltip } from '../src/components/ui/TutorialTooltip';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { formatCountdown, formatDate, todayString } from '../src/utils/dateUtils';
import { FocusSession } from '../src/types';

const MODE_LABEL: Record<string, string> = {
  pomodoro: 'Pomodoro',
  short_break: 'Nghỉ ngắn',
  long_break: 'Nghỉ dài',
};

const MODE_COLOR: Record<string, [string, string]> = {
  pomodoro: ['#6C63FF', '#8B85FF'],
  short_break: ['#56C271', '#43BCCD'],
  long_break: ['#43BCCD', '#6C63FF'],
};

export default function FocusScreen() {
  const { subjects } = useSubjectStore();
  const { 
    sessions, 
    addSession, 
    addPoints,
    pomodoroDuration,
    shortBreakDuration,
    longBreakDuration,
    updateTimerSettings,
    activeSubjectId,
    activeTaskId,
    activeSession,
    setActiveSession,
    setActiveSubjectId,
    setActiveTaskId,
    tutorialActiveTab,
    tutorialActiveStep,
    logAbandon,
  } = useFocusStore();
  const tasks = useTaskStore((s) => s.tasks);
  const incrementTaskPomodoro = useTaskStore((s) => s.incrementTaskPomodoro);

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? '');
  const [mode, setMode] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  
  // Set durations in seconds
  const modeDurationInSeconds = {
    pomodoro: pomodoroDuration * 60,
    short_break: shortBreakDuration * 60,
    long_break: longBreakDuration * 60,
  };

  const [timeLeft, setTimeLeft] = useState(modeDurationInSeconds[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Settings modal state
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [inputPomo, setInputPomo] = useState(String(pomodoroDuration));
  const [inputShort, setInputShort] = useState(String(shortBreakDuration));
  const [inputLong, setInputLong] = useState(String(longBreakDuration));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const totalTime = modeDurationInSeconds[mode];
  const progress = 1 - (totalTime > 0 ? (timeLeft / totalTime) : 0);

  // Reset time left when mode or duration settings change
  useEffect(() => {
    if (activeSession) return;
    setTimeLeft(modeDurationInSeconds[mode]);
    setIsRunning(false);
  }, [mode, pomodoroDuration, shortBreakDuration, longBreakDuration, activeSession]);

  useEffect(() => {
    if (activeSubjectId) {
      setSelectedSubjectId(activeSubjectId);
    }
  }, [activeSubjectId]);

  useEffect(() => {
    if (!activeTaskId) return;
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task || task.subjectId !== selectedSubjectId || task.status === 'done') {
      setActiveTaskId(null);
    }
  }, [activeTaskId, selectedSubjectId, tasks, setActiveTaskId]);

  useEffect(() => {
    if (tutorialActiveTab !== 'Focus' || tutorialActiveStep === null) return;
    setTimeout(() => {
      if (tutorialActiveStep === 1) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else if (tutorialActiveStep === 2) {
        scrollRef.current?.scrollTo({ y: 330, animated: true });
      } else if (tutorialActiveStep === 3) {
        scrollRef.current?.scrollTo({ y: 160, animated: true });
      }
    }, 120);
  }, [tutorialActiveTab, tutorialActiveStep]);

  useEffect(() => {
    if (!activeSession && isRunning) {
      setIsRunning(false);
      setTimeLeft(modeDurationInSeconds[mode]);
    }
  }, [activeSession, isRunning, mode, pomodoroDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleComplete();
            return 0;
          }
          const next = prev - 1;
          const session = useFocusStore.getState().activeSession;
          if (session) {
            useFocusStore.getState().setActiveSession({ ...session, timeLeft: next });
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, pomodoroDuration, shortBreakDuration, longBreakDuration]);

  const handleStartOrPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (!activeSession) {
      setActiveSession({
        subjectId: selectedSubjectId,
        taskId: activeTaskId ?? undefined,
        mode,
        timeLeft,
        totalSeconds: modeDurationInSeconds[mode],
        startedAt: new Date().toISOString(),
      });
    }
    setIsRunning(true);
  };

  const handleComplete = () => {
    setIsRunning(false);
    const completedSession = activeSession;
    const completedTaskId = completedSession?.taskId ?? activeTaskId ?? undefined;
    if (mode === 'pomodoro') {
      const count = pomodoroCount + 1;
      setPomodoroCount(count);
      const session: FocusSession = {
        id: `f_${Date.now()}`,
        subjectId: completedSession?.subjectId ?? selectedSubjectId,
        taskId: completedTaskId,
        date: todayString(),
        durationMinutes: pomodoroDuration,
        sessionType: 'pomodoro',
        completed: true,
      };
      addSession(session);
      if (completedTaskId) {
        incrementTaskPomodoro(completedTaskId);
      }
      addPoints({
        id: `p_${Date.now()}`,
        date: todayString(),
        points: Math.round(pomodoroDuration * 0.4),
        reason: 'pomodoro_done',
        description: `Hoàn thành Pomodoro ${pomodoroDuration}p 🍅`,
      });
      Alert.alert(
        '🎉 Pomodoro hoàn thành!', 
        `+${Math.round(pomodoroDuration * 0.4)} điểm!\nBạn đã hoàn thành ${count} pomodoro hôm nay.`, 
        [{ text: 'Tiếp tục', style: 'default' }]
      );
    } else {
      Alert.alert('Nghỉ ngơi xong!', 'Hãy bắt đầu một phiên Pomodoro mới để tập trung học nhé 📚', [{ text: 'Đồng ý' }]);
    }
    setActiveSession(null);
    setTimeLeft(modeDurationInSeconds[mode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveSession(null);
    setTimeLeft(modeDurationInSeconds[mode]);
  };

  const handleAbandon = () => {
    const session = activeSession;
    if (!session) {
      handleReset();
      return;
    }

    logAbandon({
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      subjectId: session.subjectId,
      taskId: session.taskId,
      mode: session.mode,
      timeLeftSeconds: session.timeLeft,
      elapsedSeconds: session.totalSeconds - session.timeLeft,
      totalSeconds: session.totalSeconds,
      reason: 'back_button',
    });
    addPoints({
      id: `p_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      points: -5,
      reason: 'abandon_penalty',
      description: 'Tru diem do dung phien tap trung',
    });
    setActiveSession(null);
    setIsRunning(false);
    setTimeLeft(modeDurationInSeconds[mode]);
    Alert.alert('Phien tap trung da dung', 'Phien nay bi tinh bo do va tru 5 diem.');
  };

  const handleSaveSettings = () => {
    const p = parseInt(inputPomo) || 25;
    const s = parseInt(inputShort) || 5;
    const l = parseInt(inputLong) || 15;
    
    if (p <= 0 || s <= 0 || l <= 0) {
      Alert.alert('Lỗi', 'Thời gian phải lớn hơn 0');
      return;
    }

    updateTimerSettings(p, s, l);
    setSettingsVisible(false);
  };

  const todaySessions = sessions.filter(
    (s) => s.date === todayString() && s.completed && s.sessionType === 'pomodoro'
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const focusTasks = tasks.filter(
    (task) => task.subjectId === selectedSubjectId && task.status !== 'done'
  );
  const selectedTask = focusTasks.find((task) => task.id === activeTaskId) ?? null;

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveSubjectId(subjectId);
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task || task.subjectId !== subjectId || task.status === 'done') {
      setActiveTaskId(null);
    }
  };

  const handleSelectTask = (taskId: string | null) => {
    setActiveSubjectId(selectedSubjectId);
    setActiveTaskId(taskId);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tutorialActiveTab === 'Focus' && tutorialActiveStep !== null && (
          <View pointerEvents="none" style={styles.tutorialBackdrop} />
        )}
        {/* Header with Title and Settings Gear */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus</Text>
          <TouchableOpacity 
            style={styles.settingsIcon} 
            onPress={() => {
              setInputPomo(String(pomodoroDuration));
              setInputShort(String(shortBreakDuration));
              setInputLong(String(longBreakDuration));
              setSettingsVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Mode selector */}
        <View style={(tutorialActiveTab === 'Focus' && tutorialActiveStep === 1) ? styles.tutorialLift : undefined}>
          <View style={styles.modeRow}>
            {(['pomodoro', 'short_break', 'long_break'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {MODE_LABEL[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {tutorialActiveTab === 'Focus' && tutorialActiveStep === 1 && (
            <View style={styles.tutorialBlock}>
              <TutorialTooltip
                step={1}
                totalSteps={3}
                title="Chọn kiểu phiên học"
                description="Pomodoro là phiên tập trung chính. Bạn cũng có thể chuyển sang nghỉ ngắn hoặc nghỉ dài khi cần."
                onNext={() => useFocusStore.getState().nextTutorialStep()}
                onSkip={() => useFocusStore.getState().skipTutorial()}
                arrowPosition="top"
              />
            </View>
          )}
        </View>

        {/* Timer ring */}
        <View style={styles.timerContainer}>
          <LinearGradient colors={MODE_COLOR[mode]} style={styles.timerGradientBg} />
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatCountdown(timeLeft)}</Text>
            <Text style={styles.timerMode}>{MODE_LABEL[mode]}</Text>
          </View>
          {/* Simple circular progress ring background */}
          <View style={[styles.progressRing, { borderColor: 'rgba(255,255,255,0.15)' }]} />
        </View>

        {/* Controls */}
        <View style={(tutorialActiveTab === 'Focus' && tutorialActiveStep === 3) ? styles.tutorialLift : undefined}>
          {tutorialActiveTab === 'Focus' && tutorialActiveStep === 3 && (
            <View style={[styles.tutorialBlock, { marginBottom: SPACING.sm }]}>
              <TutorialTooltip
                step={3}
                totalSteps={3}
                title="Bắt đầu tập trung"
                description="Bấm nút Play để khóa phiên học. Khi hoàn thành, app sẽ ghi nhận Pomodoro vào môn và task đã chọn."
                onNext={() => useFocusStore.getState().nextTutorialStep()}
                onPrev={() => useFocusStore.getState().prevTutorialStep()}
                onSkip={() => useFocusStore.getState().skipTutorial()}
                arrowPosition="bottom"
              />
            </View>
          )}
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleReset} activeOpacity={0.7}>
              <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: MODE_COLOR[mode][0] }]} 
              onPress={handleStartOrPause}
              activeOpacity={0.8}
            >
              <Ionicons name={isRunning ? 'pause' : 'play'} size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleComplete} activeOpacity={0.7}>
              <Ionicons name="checkmark" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subject selector */}
        {mode === 'pomodoro' && (
          <View style={[styles.section, (tutorialActiveTab === 'Focus' && tutorialActiveStep === 2) && styles.tutorialLift]}>
            <Text style={styles.sectionLabel}>📚 Đang học môn</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectList}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.subjectChip, 
                    selectedSubjectId === s.id && { backgroundColor: s.color, borderColor: s.color }
                  ]}
                  onPress={() => handleSelectSubject(s.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.subjectDot, { backgroundColor: selectedSubjectId === s.id ? '#fff' : s.color }]} />
                  <Text style={[styles.subjectName, selectedSubjectId === s.id && { color: '#fff' }]}>
                    {s.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Việc cần làm</Text>
              {selectedSubject && (
                <Text style={[styles.sectionHint, { color: selectedSubject.color }]} numberOfLines={1}>
                  {selectedSubject.shortName}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.taskOption,
                activeTaskId === null && styles.taskOptionActive,
                activeTaskId === null && { borderColor: selectedSubject?.color ?? COLORS.primary },
              ]}
              onPress={() => handleSelectTask(null)}
              activeOpacity={0.82}
            >
              <View style={[styles.taskRadio, activeTaskId === null && { borderColor: selectedSubject?.color ?? COLORS.primary }]}>
                {activeTaskId === null && (
                  <View style={[styles.taskRadioDot, { backgroundColor: selectedSubject?.color ?? COLORS.primary }]} />
                )}
              </View>
              <View style={styles.taskOptionText}>
                <Text style={styles.taskTitle} numberOfLines={1}>Chỉ ghi nhận theo môn học</Text>
              </View>
            </TouchableOpacity>

            {focusTasks.length > 0 ? (
              <View style={styles.taskList}>
                {focusTasks.map((task) => {
                  const isSelected = activeTaskId === task.id;
                  const subjectColor = selectedSubject?.color ?? COLORS.primary;
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskOption,
                        isSelected && styles.taskOptionActive,
                        isSelected && { borderColor: subjectColor },
                      ]}
                      onPress={() => handleSelectTask(task.id)}
                      activeOpacity={0.82}
                    >
                      <View style={[styles.taskRadio, isSelected && { borderColor: subjectColor }]}>
                        {isSelected && <View style={[styles.taskRadioDot, { backgroundColor: subjectColor }]} />}
                      </View>
                      <View style={styles.taskOptionText}>
                        <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
                        <View style={styles.taskMetaRow}>
                          <Text style={styles.taskMeta} numberOfLines={1}>
                            {task.actualPomodoros}/{task.estimatedPomodoros} Pomodoro
                          </Text>
                          <View style={styles.taskMetaDivider} />
                          <Text style={styles.taskMeta} numberOfLines={1}>
                            Hạn {formatDate(task.dueDate)}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={subjectColor} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyTasks}>
                <Ionicons name="checkbox-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.emptyTasksText}>
                  Môn này chưa có task đang mở. Bạn vẫn có thể bắt đầu để ghi nhận theo môn.
                </Text>
              </View>
            )}

            {selectedTask && (
              <View style={[styles.selectedTaskBanner, { borderLeftColor: selectedSubject?.color ?? COLORS.primary }]}>
                <Ionicons name="timer-outline" size={16} color={selectedSubject?.color ?? COLORS.primary} />
                <Text style={styles.selectedTaskText} numberOfLines={1}>
                  Phiên này sẽ ghi vào: {selectedTask.title}
                </Text>
              </View>
            )}
            {tutorialActiveTab === 'Focus' && tutorialActiveStep === 2 && (
              <View style={styles.tutorialBlock}>
                <TutorialTooltip
                  step={2}
                  totalSteps={3}
                  title="Gắn phiên học với task"
                  description="Chọn môn trước, rồi chọn task đang mở của môn đó. Nếu chưa có task, bạn vẫn có thể ghi nhận phiên theo môn."
                  onNext={() => useFocusStore.getState().nextTutorialStep()}
                  onPrev={() => useFocusStore.getState().prevTutorialStep()}
                  onSkip={() => useFocusStore.getState().skipTutorial()}
                  arrowPosition="top"
                />
              </View>
            )}
          </View>
        )}

        {/* Today stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{todaySessions.length}</Text>
            <Text style={styles.statLabel}>Pomodoro</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0)}
            </Text>
            <Text style={styles.statLabel}>Phút tập trung</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {todaySessions.reduce((acc, s) => acc + Math.round(s.durationMinutes * 0.4), 0)}
            </Text>
            <Text style={styles.statLabel}>Điểm thưởng</Text>
          </View>
        </View>

        {/* Recent sessions */}
        {todaySessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🍅 Phiên học hôm nay</Text>
            <View style={styles.sessionDots}>
              {todaySessions.map((sess, i) => {
                const subColor = subjects.find(s => s.id === sess.subjectId)?.color ?? COLORS.primary;
                return (
                  <View key={i} style={[styles.sessionDot, { backgroundColor: subColor }]} />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Settings Modal */}
      <ModalContainer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        title="Thiết lập thời gian"
      >
        <View style={styles.settingsForm}>
          {/* Pomodoro */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingsLabel}>Thời gian học Pomodoro (phút)</Text>
            <TextInput
              style={styles.settingsInput}
              keyboardType="number-pad"
              value={inputPomo}
              onChangeText={setInputPomo}
            />
          </View>

          {/* Short Break */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingsLabel}>Thời gian Nghỉ ngắn (phút)</Text>
            <TextInput
              style={styles.settingsInput}
              keyboardType="number-pad"
              value={inputShort}
              onChangeText={setInputShort}
            />
          </View>

          {/* Long Break */}
          <View style={styles.inputGroup}>
            <Text style={styles.settingsLabel}>Thời gian Nghỉ dài (phút)</Text>
            <TextInput
              style={styles.settingsInput}
              keyboardType="number-pad"
              value={inputLong}
              onChangeText={setInputLong}
            />
          </View>

          <TouchableOpacity style={styles.btnSave} onPress={handleSaveSettings} activeOpacity={0.8}>
            <Text style={styles.btnSaveText}>Lưu thiết lập</Text>
          </TouchableOpacity>
        </View>
      </ModalContainer>

      <FocusLockScreen
        visible={activeSession !== null}
        mode={activeSession?.mode ?? mode}
        timeLeft={activeSession?.timeLeft ?? timeLeft}
        isRunning={isRunning}
        onBack={handleAbandon}
        onTogglePause={handleStartOrPause}
        onComplete={handleComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: 40, position: 'relative' },
  tutorialBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 22, 0.72)',
    zIndex: 1000,
  },
  tutorialLift: {
    zIndex: 1001,
    elevation: 24,
  },
  tutorialBlock: {
    zIndex: 1002,
    elevation: 25,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  modeRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4, marginBottom: SPACING.lg, ...SHADOW.sm },
  modeBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: RADIUS.md },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: COLORS.textSecondary },
  modeBtnTextActive: { color: '#fff' },
  timerContainer: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  timerGradientBg: { ...StyleSheet.absoluteFillObject },
  progressRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 110,
    borderWidth: 12,
    margin: 6,
  },
  timerInner: { alignItems: 'center', zIndex: 1 },
  timerText: { fontSize: 52, fontWeight: FONT_WEIGHT.bold, color: '#fff', letterSpacing: 2 },
  timerMode: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  controlRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: SPACING.xl },
  ctrlBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
  section: { marginBottom: SPACING.md },
  sectionLabel: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  sectionHint: { flexShrink: 1, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  subjectList: { gap: 8, paddingBottom: 4 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOW.sm },
  subjectDot: { width: 7, height: 7, borderRadius: 4 },
  subjectName: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  taskList: { gap: SPACING.sm, marginTop: SPACING.sm },
  taskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    ...SHADOW.sm,
  },
  taskOptionActive: {
    backgroundColor: COLORS.surfaceElevated,
  },
  taskRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskOptionText: { flex: 1, minWidth: 0 },
  taskTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  taskMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  taskMetaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  emptyTasks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    marginTop: SPACING.sm,
  },
  emptyTasksText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.textMuted, lineHeight: 20 },
  selectedTaskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: 10,
    marginTop: SPACING.sm,
  },
  selectedTaskText: { flex: 1, fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', ...SHADOW.sm },
  statNum: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  sessionDots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionDot: { width: 28, height: 28, borderRadius: 14 },
  settingsForm: {
    gap: 12,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  settingsLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  settingsInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
});
