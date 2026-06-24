import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore, useSubjectStore, useFocusStore } from '../src/store';
import { TaskFormModal } from '../src/components/tasks/TaskFormModal';
import { TaskCard } from '../src/components/tasks/TaskCard';
import { SubjectFormContent } from '../src/components/subjects/SubjectFormModal';
import { SubjectCard } from '../src/components/subjects/SubjectCard';
import { ModalContainer } from '../src/components/ui/ModalContainer';
import { TouchableScale } from '../src/components/ui/TouchableScale';
import { FadeInView } from '../src/components/ui/FadeInView';
import { TutorialTooltip } from '../src/components/ui/TutorialTooltip';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { TaskStatus, StudyTask, Subject } from '../src/types';

const STATUS_TABS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'todo', label: 'Cần làm' },
  { key: 'in_progress', label: 'Đang làm' },
  { key: 'done', label: 'Xong' },
];

export default function TasksScreen() {
  const { tasks, toggleTaskDone } = useTaskStore();
  const { subjects } = useSubjectStore();
  const { tutorialActiveTab, tutorialActiveStep } = useFocusStore();
  const [activeStatus, setActiveStatus] = useState<TaskStatus | 'all'>('all');
  const [activeSubject, setActiveSubject] = useState<string>('all');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<StudyTask | undefined>(undefined);

  const [subjectsVisible, setSubjectsVisible] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState<'manager' | 'form'>('manager');
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => activeStatus === 'all' || t.status === activeStatus)
      .filter((t) => activeSubject === 'all' || t.subjectId === activeSubject)
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        const pOrder = { high: 0, medium: 1, low: 2 };
        return pOrder[a.priority] - pOrder[b.priority];
      });
  }, [tasks, activeStatus, activeSubject]);

  const counts: Record<string, number> = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const handleOpenAdd = () => {
    setSelectedTask(undefined);
    setModalVisible(true);
  };

  const handleOpenEdit = (task: StudyTask) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.title}>Công việc</Text>
          <TouchableOpacity
            style={styles.btnManageSubjects}
            onPress={() => setSubjectsVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open-outline" size={15} color={COLORS.primary} />
            <Text style={styles.manageSubjectsText}>Chủ đề</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{tasks.filter(t => t.status !== 'done').length} việc cần làm</Text>
        </View>
      </View>

      {/* Status filter tabs */}
      <View style={[
        styles.tabContainer,
        (tutorialActiveTab === 'Tasks' && tutorialActiveStep === 2) && { zIndex: 1001, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, ...SHADOW.lg }
      ]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabContent}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeStatus === tab.key && styles.tabActive]}
              onPress={() => setActiveStatus(tab.key)}
            >
              <Text style={[styles.tabText, activeStatus === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabCount, activeStatus === tab.key && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, activeStatus === tab.key && { color: COLORS.primary }]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tooltip Step 2 */}
      {tutorialActiveTab === 'Tasks' && tutorialActiveStep === 2 && (
        <View style={{ zIndex: 1001, marginHorizontal: SPACING.md, marginTop: 8 }}>
          <TutorialTooltip
            step={2}
            totalSteps={2}
            title="Bộ lọc công việc"
            description="Lọc theo trạng thái hoặc theo môn học để tìm đúng việc cần xử lý."
            onNext={() => useFocusStore.getState().nextTutorialStep()}
            onPrev={() => useFocusStore.getState().prevTutorialStep()}
            onSkip={() => useFocusStore.getState().skipTutorial()}
            arrowPosition="top"
          />
        </View>
      )}

      {/* Subject filter */}
      <View style={styles.subjectContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectRow} contentContainerStyle={styles.subjectContent}>
          <TouchableOpacity
            style={[styles.subjectChip, activeSubject === 'all' && styles.subjectChipActive]}
            onPress={() => setActiveSubject('all')}
          >
            <Text style={[styles.subjectChipText, activeSubject === 'all' && styles.subjectChipTextActive]}>Tất cả môn</Text>
          </TouchableOpacity>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.subjectChip, activeSubject === s.id && { backgroundColor: s.color, borderColor: s.color }]}
              onPress={() => setActiveSubject(s.id)}
            >
              <View style={[styles.subjectDot, { backgroundColor: activeSubject === s.id ? '#fff' : s.color }]} />
              <Text style={[styles.subjectChipText, activeSubject === s.id && { color: '#fff' }]}>{s.shortName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name={tasks.length === 0 ? 'clipboard-outline' : 'search-outline'} size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {tasks.length === 0 ? 'Chưa có công việc nào' : 'Không có công việc phù hợp'}
            </Text>
            <Text style={styles.emptySubtext}>
              {tasks.length === 0 ? 'Tạo công việc đầu tiên để bắt đầu học có mục tiêu.' : 'Thử đổi bộ lọc hoặc tạo thêm việc mới.'}
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handleOpenAdd} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.emptyActionText}>Tạo công việc</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((task, index) => (
            <FadeInView key={task.id} delay={index * 60}>
              <TaskCard 
                task={task} 
                onToggle={toggleTaskDone} 
              />
            </FadeInView>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button Container */}
      <View style={[
        styles.fabContainer,
        (tutorialActiveTab === 'Tasks' && tutorialActiveStep === 1) && { zIndex: 1001 }
      ]}>
        {tutorialActiveTab === 'Tasks' && tutorialActiveStep === 1 && (
          <View style={styles.fabTooltip}>
            <TutorialTooltip
              step={1}
              totalSteps={2}
              title="Thêm công việc mới"
              description="Bấm dấu cộng để tạo việc cần làm, đặt độ ưu tiên và ước lượng số phiên tập trung."
              onNext={() => useFocusStore.getState().nextTutorialStep()}
              onSkip={() => useFocusStore.getState().skipTutorial()}
              arrowPosition="bottom"
            />
          </View>
        )}
        <TouchableScale 
          style={[
            styles.fab,
            (tutorialActiveTab === 'Tasks' && tutorialActiveStep === 1) && { borderColor: '#fff', borderWidth: 2, ...SHADOW.lg }
          ]} 
          onPress={handleOpenAdd} 
          activeScale={0.9}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableScale>
      </View>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        taskToEdit={selectedTask}
      />

      {/* Combined Subject Modal */}
      <ModalContainer
        visible={subjectsVisible}
        onClose={() => {
          setSubjectsVisible(false);
          setSubjectModalMode('manager');
        }}
        title={subjectModalMode === 'manager' ? "Quản lý chủ đề học tập" : (selectedSubject ? "Sửa chủ đề" : "Thêm chủ đề mới")}
      >
        {subjectModalMode === 'manager' ? (
          <View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350, paddingBottom: 10 }}>
              {subjects.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    setSelectedSubject(sub);
                    setSubjectModalMode('form');
                  }}
                  activeOpacity={0.7}
                  style={{ marginBottom: 2 }}
                >
                  <SubjectCard subject={sub} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.btnAddSubject}
              onPress={() => {
                setSelectedSubject(undefined);
                setSubjectModalMode('form');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.btnAddSubjectText}>Thêm chủ đề mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SubjectFormContent
            subjectToEdit={selectedSubject}
            onSuccess={() => setSubjectModalMode('manager')}
            onCancel={() => setSubjectModalMode('manager')}
          />
        )}
      </ModalContainer>
      {/* Tutorial Backdrop Overlay */}
      {tutorialActiveTab === 'Tasks' && tutorialActiveStep !== null && (
        <View pointerEvents="none" style={styles.tutorialBackdrop} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  btnManageSubjects: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    marginTop: 2,
  },
  manageSubjectsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  btnAddSubject: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginTop: 12,
  },
  btnAddSubjectText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  countBadge: { backgroundColor: COLORS.primaryLight + '20', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
  tabContainer: { height: 52 },
  tabRow: { flex: 1 },
  tabContent: { paddingHorizontal: SPACING.md, gap: 8, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium, color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  tabCount: { backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1 },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabCountText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.semibold },
  subjectContainer: { height: 44, marginTop: 8 },
  subjectRow: { flex: 1 },
  subjectContent: { paddingHorizontal: SPACING.md, gap: 8, alignItems: 'center' },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  subjectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subjectChipText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  subjectChipTextActive: { color: '#fff' },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },
  list: { flex: 1, marginTop: 8 },
  listContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textMuted },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 19,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'flex-end',
  },
  fabTooltip: {
    width: 250,
    marginBottom: 8,
    marginRight: -10,
  },
  tutorialBackdrop: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(10, 11, 22, 0.72)',
    zIndex: 1000,
  },
});
