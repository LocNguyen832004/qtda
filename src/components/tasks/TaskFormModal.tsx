import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ModalContainer } from '../ui/ModalContainer';
import { StudyTask, TaskPriority, Subject, SubjectColor } from '../../types';
import { useTaskStore, useSubjectStore, useFocusStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';
import { todayString, dateToString } from '../../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { TutorialTooltip } from '../ui/TutorialTooltip';

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  taskToEdit?: StudyTask;
}

type WizardStep = 1 | 2;

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  { key: 'low', label: 'Thấp', color: COLORS.priorityLow },
  { key: 'medium', label: 'Trung bình', color: COLORS.priorityMedium },
  { key: 'high', label: 'Cao', color: COLORS.priorityHigh },
];

const SUBJECT_COLOR_SWATCHES: SubjectColor[] = [
  '#6C63FF',
  '#FF6584',
  '#43BCCD',
  '#F9A826',
  '#56C271',
  '#E8724A',
];

const STEP_META: Record<WizardStep, { title: string; hint: string }> = {
  1: { title: 'Chọn môn học', hint: 'Chọn môn học liên kết với công việc này.' },
  2: { title: 'Thông tin công việc', hint: 'Nhập tên, hạn và độ ưu tiên.' },
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  taskToEdit,
}) => {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const { subjects, addSubject } = useSubjectStore();
  const { pomodoroDuration, tutorialActiveTab } = useFocusStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? 's_general');
  const [dueDate, setDueDate] = useState(todayString());
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estPomos, setEstPomos] = useState(2);

  // Inline subject creation
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectShort, setNewSubjectShort] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState<SubjectColor | string>('#6C63FF');
  const [newSubjectTargetHours, setNewSubjectTargetHours] = useState('');

  useEffect(() => {
    if (visible) {
      setStep(1);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description ?? '');
        setSubjectId(taskToEdit.subjectId);
        setDueDate(taskToEdit.dueDate);
        setPriority(taskToEdit.priority);
        setEstPomos(taskToEdit.estimatedPomodoros);
      } else {
        setTitle('');
        setDescription('');
        setSubjectId(subjects[0]?.id ?? 's_general');
        setDueDate(todayString());
        setPriority('medium');
        setEstPomos(2);
      }
      setShowSubjectForm(false);
      setNewSubjectName('');
      setNewSubjectShort('');
      setNewSubjectColor('#6C63FF');
      setNewSubjectTargetHours('');
    }
  }, [visible, taskToEdit, subjects]);

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ đề');
      return;
    }
    if (!newSubjectShort.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên viết tắt');
      return;
    }

    const parsedTargetHours = newSubjectTargetHours ? parseFloat(newSubjectTargetHours) : 5;
    const targetHoursNum = isNaN(parsedTargetHours) ? 5 : parsedTargetHours;

    const newId = `s_${Date.now()}`;
    const newSubject: Subject = {
      id: newId,
      name: newSubjectName.trim(),
      shortName: newSubjectShort.trim().toUpperCase(),
      studiedHours: 0,
      color: newSubjectColor as SubjectColor,
      targetHours: targetHoursNum,
    };
    addSubject(newSubject);
    setSubjectId(newId);
    setShowSubjectForm(false);
    setNewSubjectName('');
    setNewSubjectShort('');
    setNewSubjectColor('#6C63FF');
    setNewSubjectTargetHours('');
  };

  const setPresetDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(dateToString(d));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!subjectId) {
        Alert.alert('Chọn môn học', 'Chọn một môn hoặc tạo môn mới.');
        return;
      }
      setStep(2);
      return;
    }
    handleSubmit();
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công việc');
      return;
    }
    if (!subjectId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chủ đề học tập');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      Alert.alert('Lỗi', 'Hạn hoàn thành cần theo mẫu năm-tháng-ngày, ví dụ 2026-05-28');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        subjectId,
        dueDate,
        priority,
        estimatedPomodoros: estPomos,
      });
    } else {
      const newTask: StudyTask = {
        id: `t_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        subjectId,
        dueDate,
        priority,
        status: 'todo',
        estimatedPomodoros: estPomos,
        actualPomodoros: 0,
      };
      addTask(newTask);

      const store = useFocusStore.getState();
      if (store.tutorialActiveTab === 'Tasks') {
        Alert.alert(
          'Chúc mừng! 🎉',
          'Bạn đã tạo công việc đầu tiên thành công! Bây giờ hãy chuyển sang màn hình Tập trung để bắt đầu hoàn thành công việc này nhé.',
          [
            {
              text: 'Tiếp tục',
              onPress: () => {
                onClose();
                store.completeTutorial('Tasks');
              },
            },
          ]
        );
        return;
      }
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit) {
      Alert.alert('Xóa công việc', 'Bạn có chắc muốn xóa công việc này?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            deleteTask(taskToEdit.id);
            onClose();
          },
        },
      ]);
    }
  };

  const renderStepHeader = () => (
    <View style={styles.stepHeader}>
      <View style={styles.progressRow}>
        {([1, 2] as WizardStep[]).map((item) => {
          const isActive = item === step;
          const isDone = item < step;
          return (
            <View key={item} style={styles.progressItem}>
              <View style={[styles.progressDot, (isActive || isDone) && styles.progressDotActive]}>
                <Text style={[styles.progressDotText, (isActive || isDone) && styles.progressDotTextActive]}>
                  {isDone ? '✓' : item}
                </Text>
              </View>
              {item < 2 && <View style={[styles.progressLine, isDone && styles.progressLineActive]} />}
            </View>
          );
        })}
      </View>
      <Text style={styles.stepTitle}>{STEP_META[step].title}</Text>
      <Text style={styles.stepHint}>{STEP_META[step].hint}</Text>
    </View>
  );

  const renderSubjectStep = () => (
    <View style={styles.stepContent}>
      {/* Chọn môn học */}
      <View style={styles.inputGroup}>
        <View style={styles.subjectLabelRow}>
          <Text style={styles.label}>Môn học *</Text>
          <TouchableOpacity
            style={styles.btnAddSubjectInline}
            onPress={() => setShowSubjectForm(!showSubjectForm)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showSubjectForm ? 'close-circle-outline' : 'add-circle-outline'}
              size={15}
              color={COLORS.primary}
            />
            <Text style={styles.btnAddSubjectInlineText}>
              {showSubjectForm ? 'Hủy' : 'Thêm môn'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách chủ đề có sẵn */}
        {subjects.length === 0 && !showSubjectForm ? (
          <TouchableOpacity
            style={styles.emptySubjectHint}
            onPress={() => setShowSubjectForm(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.emptySubjectHintText}>Chưa có chủ đề nào. Nhấn để tạo ngay!</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectList}>
            {subjects.map((sub) => {
              const isSelected = subjectId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.subjectChip,
                    isSelected && { backgroundColor: sub.color, borderColor: sub.color },
                  ]}
                  onPress={() => setSubjectId(sub.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.subjectDot, { backgroundColor: isSelected ? '#fff' : sub.color }]} />
                  <Text style={[styles.subjectChipText, isSelected && { color: '#fff' }]}>
                    {sub.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Inline subject creation form */}
        {showSubjectForm && (
          <View style={styles.inlineSubjectForm}>
            <View style={styles.inlineSubjectHeader}>
              <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
              <Text style={styles.inlineSubjectTitle}>Tạo môn học mới</Text>
            </View>
            <TextInput
              style={styles.inlineInput}
              placeholder="Tên môn học (vd: Giải tích, Tiếng Anh)"
              placeholderTextColor={COLORS.textMuted}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />
            <TextInput
              style={styles.inlineInput}
              placeholder="Viết tắt (tối đa 6 ký tự)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              maxLength={6}
              value={newSubjectShort}
              onChangeText={setNewSubjectShort}
            />
            <TextInput
              style={styles.inlineInput}
              placeholder="Mục tiêu tự học hằng tuần (vd: 6 giờ)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={newSubjectTargetHours}
              onChangeText={setNewSubjectTargetHours}
            />
            <View style={styles.inlineColorRow}>
              {SUBJECT_COLOR_SWATCHES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.inlineColorCircle,
                    { backgroundColor: c },
                    newSubjectColor === c && styles.inlineColorCircleSelected,
                  ]}
                  onPress={() => setNewSubjectColor(c)}
                  activeOpacity={0.8}
                >
                  {newSubjectColor === c && <View style={styles.inlineColorInner} />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.btnCreateSubject}
              onPress={handleCreateSubject}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.btnCreateSubjectText}>Tạo & chọn môn này</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderTaskInfoStep = () => (
    <View style={styles.stepContent}>
      {/* Tiêu đề */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên công việc *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Đọc chương 2, làm bài tập 3"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Mô tả */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nội dung chi tiết công việc..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Due date picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hạn hoàn thành *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 2026-05-28"
          placeholderTextColor={COLORS.textMuted}
          value={dueDate}
          onChangeText={setDueDate}
        />
        <Text style={styles.helperText}>Chọn nhanh bên dưới hoặc nhập theo mẫu năm-tháng-ngày.</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDate(0)}>
            <Text style={styles.presetText}>Hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDate(1)}>
            <Text style={styles.presetText}>Ngày mai</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDate(3)}>
            <Text style={styles.presetText}>3 ngày tới</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDate(7)}>
            <Text style={styles.presetText}>1 tuần</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stepper số lượng Phiên học */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số phiên học ước lượng *</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setEstPomos((prev) => Math.max(1, prev - 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepValueBox}>
            <Text style={styles.stepValueText}>{estPomos} ⏱️</Text>
            <Text style={styles.stepSubText}>(~ {estPomos * pomodoroDuration} phút tập trung)</Text>
          </View>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setEstPomos((prev) => Math.min(10, prev + 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Độ ưu tiên */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Độ ưu tiên</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityBtn,
                  isSelected && { backgroundColor: p.color, borderColor: p.color },
                ]}
                onPress={() => setPriority(p.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.priorityText, isSelected && { color: '#fff' }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={taskToEdit ? 'Chi tiết công việc' : 'Tạo công việc mới'}
      fullScreen={true}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        {tutorialActiveTab === 'Tasks' ? (
          <View style={{ marginBottom: 12 }}>
            {step === 1 && (
              <TutorialTooltip
                step={1}
                totalSteps={2}
                title="Chọn môn học"
                description="Chọn môn học mà công việc này thuộc về, sau đó bấm Tiếp tục."
                hideNext={true}
                onSkip={() => useFocusStore.getState().skipTutorial()}
              />
            )}
            {step === 2 && (
              <TutorialTooltip
                step={2}
                totalSteps={2}
                title="Thông tin công việc"
                description="Nhập tên, mô tả, chọn hạn hoàn thành và ước lượng số phiên Pomodoro cần học, sau đó bấm Lưu công việc."
                hideNext={true}
                onSkip={() => useFocusStore.getState().skipTutorial()}
              />
            )}
          </View>
        ) : (
          renderStepHeader()
        )}
        {step === 1 ? renderSubjectStep() : renderTaskInfoStep()}

        {/* Buttons */}
        <View style={styles.actionRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.btnDelete} onPress={handleBack} activeOpacity={0.8}>
              <Text style={styles.btnDeleteText}>Quay lại</Text>
            </TouchableOpacity>
          ) : (
            taskToEdit && (
              <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} activeOpacity={0.8}>
                <Text style={styles.btnDeleteText}>Xóa việc</Text>
              </TouchableOpacity>
            )
          )}
          <TouchableOpacity
            style={[styles.btnSubmit, { flex: 1 }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{step === 2 ? 'Lưu công việc' : 'Tiếp tục'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 12,
    paddingBottom: 20,
  },
  stepHeader: {
    gap: 6,
    paddingBottom: SPACING.xs,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressDotText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  progressDotTextActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
    borderRadius: 1,
    backgroundColor: COLORS.border,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  stepHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  stepContent: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  subjectList: {
    gap: 8,
    paddingBottom: 4,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subjectChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  presetText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValueBox: {
    alignItems: 'center',
  },
  stepValueText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  stepSubText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  priorityText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btnSubmit: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: COLORS.danger + '15',
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDeleteText: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  // Inline subject styles
  subjectLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnAddSubjectInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '15',
  },
  btnAddSubjectInlineText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptySubjectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  emptySubjectHintText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  inlineSubjectForm: {
    marginTop: 8,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    gap: 8,
  },
  inlineSubjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  inlineSubjectTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  inlineInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  inlineColorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  inlineColorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineColorCircleSelected: {
    borderWidth: 2.5,
    borderColor: COLORS.textPrimary,
  },
  inlineColorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  btnCreateSubject: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  btnCreateSubjectText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
});
