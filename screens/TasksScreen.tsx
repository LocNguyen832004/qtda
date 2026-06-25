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

  const doneCount = tasks.filter((task) => task.status === 'done').length;

  const filtered = useMemo(() => {
    return tasks
      .filter((task) => activeStatus === 'all' || task.status === activeStatus)
      .filter((task) => activeSubject === 'all' || task.subjectId === activeSubject)
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, activeStatus, activeSubject]);

  const counts: Record<string, number> = {
    all: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    in_progress: tasks.filter((task) => task.status === 'in_progress').length,
    done: doneCount,
  };

  const handleOpenAdd = () => {
    setSelectedTask(undefined);
    setModalVisible(true);
  };



  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Công việc</Text>
        </View>
        <TouchableOpacity style={styles.headerAddButton} onPress={handleOpenAdd} activeOpacity={0.84}>
          <Ionicons name="add" size={19} color="#fff" />
          <Text style={styles.headerAddText}>Tạo việc</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.filterPanelHeader}>
          <View>
            <Text style={styles.filterTitle}>Bộ lọc</Text>
          </View>
          {(activeStatus !== 'all' || activeSubject !== 'all') && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setActiveStatus('all');
                setActiveSubject('all');
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.clearFilterText}>Xóa lọc</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Trạng thái</Text>
          <View style={styles.statusGrid}>
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.statusButton, isActive && styles.statusButtonActive]}
                  onPress={() => setActiveStatus(tab.key)}
                  activeOpacity={0.82}
                >
                  <Text style={[styles.statusText, isActive && styles.statusTextActive]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                  <Text style={[styles.statusCount, isActive && styles.statusCountActive]}>
                    {counts[tab.key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <View style={styles.subjectHeaderRow}>
            <Text style={styles.filterLabel}>Môn học</Text>
            <TouchableOpacity
              style={styles.manageSubjectButton}
              onPress={() => setSubjectsVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="folder-open-outline" size={14} color={COLORS.primary} />
              <Text style={styles.manageSubjectText}>Quản lý môn</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectContent}>
            <TouchableOpacity
              style={[styles.subjectChip, activeSubject === 'all' && styles.subjectChipActive]}
              onPress={() => setActiveSubject('all')}
              activeOpacity={0.82}
            >
              <Text style={[styles.subjectChipText, activeSubject === 'all' && styles.subjectChipTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            {subjects.map((subject) => {
              const isActive = activeSubject === subject.id;
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[styles.subjectChip, isActive && { backgroundColor: subject.color, borderColor: subject.color }]}
                  onPress={() => setActiveSubject(subject.id)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.subjectDot, { backgroundColor: isActive ? '#fff' : subject.color }]} />
                  <Text style={[styles.subjectChipText, isActive && { color: '#fff' }]}>{subject.shortName}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name={tasks.length === 0 ? 'clipboard-outline' : 'search-outline'} size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {tasks.length === 0 ? 'Chưa có công việc nào' : 'Không có việc phù hợp'}
            </Text>
            <Text style={styles.emptySubtext}>
              {tasks.length === 0 ? 'Tạo việc đầu tiên để bắt đầu học có kế hoạch.' : 'Thử đổi bộ lọc hoặc tạo việc mới.'}
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handleOpenAdd} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.emptyActionText}>Tạo công việc</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((task, index) => (
            <FadeInView key={task.id} delay={index * 60}>
              <TaskCard task={task} onToggle={toggleTaskDone} />
            </FadeInView>
          ))
        )}
      </ScrollView>

      <View style={[
        styles.fabContainer,
        (tutorialActiveTab === 'Tasks' && tutorialActiveStep === 1) && { zIndex: 1001 }
      ]}>
        {tutorialActiveTab === 'Tasks' && tutorialActiveStep === 1 && (
          <View style={styles.fabTooltip}>
            <TutorialTooltip
              step={1}
              totalSteps={1}
              title="Lên kế hoạch"
              description="Mỗi lịch học sẽ đi kèm các công việc (to-do) tương ứng. Hãy bấm dấu + này để tạo công việc đầu tiên nhé."
              hideNext={true}
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

      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        taskToEdit={selectedTask}
      />

      <ModalContainer
        visible={subjectsVisible}
        onClose={() => {
          setSubjectsVisible(false);
          setSubjectModalMode('manager');
        }}
        title={subjectModalMode === 'manager' ? 'Quản lý môn học' : (selectedSubject ? 'Sửa môn học' : 'Thêm môn học')}
      >
        {subjectModalMode === 'manager' ? (
          <View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350, paddingBottom: 10 }}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setSubjectModalMode('form');
                  }}
                  activeOpacity={0.7}
                  style={{ marginBottom: 2 }}
                >
                  <SubjectCard subject={subject} />
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
              <Text style={styles.btnAddSubjectText}>Thêm môn học</Text>
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

      {tutorialActiveTab === 'Tasks' && tutorialActiveStep !== null && (
        <View pointerEvents="none" style={styles.tutorialBackdrop} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: 16,
    paddingBottom: SPACING.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  headerAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 13,
    paddingVertical: 10,
    ...SHADOW.sm,
  },
  headerAddText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  filterPanel: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOW.sm,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  filterTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  filterSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  clearFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderLight,
  },
  clearFilterText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  filterGroup: {
    gap: SPACING.sm,
  },
  tutorialLift: {
    zIndex: 1001,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOW.lg,
  },
  tutorialTooltipBlock: {
    zIndex: 1001,
  },
  filterLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 7,
  },
  statusButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  statusTextActive: {
    color: '#fff',
  },
  statusCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statusCountActive: {
    color: 'rgba(255,255,255,0.78)',
  },
  subjectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  manageSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  manageSubjectText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  subjectContent: { gap: 8, alignItems: 'center' },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  subjectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subjectChipText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.semibold },
  subjectChipTextActive: { color: '#fff' },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },
  list: { flex: 1, marginTop: SPACING.md },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 56, gap: 12 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.semibold },
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
