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
import { ScheduleSlot, DayOfWeek, Subject, SubjectColor } from '../../types';
import { useScheduleStore, useSubjectStore, useFocusStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { TutorialTooltip } from '../ui/TutorialTooltip';

type WizardStep = 1 | 2 | 3;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SUBJECT_COLOR_SWATCHES: SubjectColor[] = [
  '#6C63FF',
  '#FF6584',
  '#43BCCD',
  '#F9A826',
  '#56C271',
  '#E8724A',
];

interface ScheduleFormModalProps {
  visible: boolean;
  onClose: () => void;
  slotToEdit?: ScheduleSlot;
  defaultDay?: DayOfWeek;
}

const DAYS: { key: DayOfWeek; label: string; fullLabel: string }[] = [
  { key: 1, label: 'T2', fullLabel: 'Thứ 2' },
  { key: 2, label: 'T3', fullLabel: 'Thứ 3' },
  { key: 3, label: 'T4', fullLabel: 'Thứ 4' },
  { key: 4, label: 'T5', fullLabel: 'Thứ 5' },
  { key: 5, label: 'T6', fullLabel: 'Thứ 6' },
  { key: 6, label: 'T7', fullLabel: 'Thứ 7' },
  { key: 0, label: 'CN', fullLabel: 'Chủ nhật' },
];

const TYPES: { key: ScheduleSlot['type']; label: string; color: string; icon: IconName }[] = [
  { key: 'lecture', label: 'Lý thuyết', color: COLORS.primary, icon: 'school-outline' },
  { key: 'lab', label: 'Thực hành', color: COLORS.secondary, icon: 'flask-outline' },
  { key: 'tutorial', label: 'Bài tập', color: COLORS.accent, icon: 'create-outline' },
  { key: 'self_study', label: 'Tự học', color: COLORS.success, icon: 'book-outline' },
  { key: 'group_study', label: 'Học nhóm', color: '#8B85FF', icon: 'people-outline' },
];

const STEP_META: Record<WizardStep, { title: string; hint: string }> = {
  1: { title: 'Chọn môn học', hint: 'Chọn môn có sẵn hoặc tạo môn mới.' },
  2: { title: 'Thời gian & địa điểm', hint: 'Chọn thứ, giờ học và nơi học.' },
  3: { title: 'Loại tiết học', hint: 'Chọn kiểu buổi học rồi lưu.' },
};

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  visible,
  onClose,
  slotToEdit,
  defaultDay = 1,
}) => {
  const { addSlot, updateSlot, deleteSlot } = useScheduleStore();
  const { subjects, addSubject } = useSubjectStore();
  const { tutorialActiveTab } = useFocusStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:10');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<ScheduleSlot['type']>('lecture');

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectShort, setNewSubjectShort] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState<SubjectColor | string>('#6C63FF');
  const [newSubjectTargetHours, setNewSubjectTargetHours] = useState('');

  useEffect(() => {
    if (visible) {
      setStep(1);
      if (slotToEdit) {
        setSubjectId(slotToEdit.subjectId);
        setDayOfWeek(slotToEdit.dayOfWeek);
        setStartTime(slotToEdit.startTime);
        setEndTime(slotToEdit.endTime);
        setRoom(slotToEdit.room ?? '');
        setType(slotToEdit.type);
      } else {
        setSubjectId(subjects[0]?.id ?? '');
        setDayOfWeek(defaultDay);
        setStartTime('07:30');
        setEndTime('09:10');
        setRoom('');
        setType('lecture');
      }
      setShowSubjectForm(false);
      setNewSubjectName('');
      setNewSubjectShort('');
      setNewSubjectColor('#6C63FF');
      setNewSubjectTargetHours('');
    }
  }, [visible, slotToEdit, defaultDay]);

  const selectedSubject = subjects.find((sub) => sub.id === subjectId);
  const selectedDay = DAYS.find((day) => day.key === dayOfWeek);

  const validateTime = () => {
    const timeReg = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeReg.test(startTime) || !timeReg.test(endTime)) {
      Alert.alert('Kiểm tra lại giờ học', 'Nhập theo dạng 07:30 hoặc 13:45.');
      return false;
    }

    if (startTime.localeCompare(endTime) >= 0) {
      Alert.alert('Kiểm tra lại giờ học', 'Giờ kết thúc cần sau giờ bắt đầu.');
      return false;
    }

    return true;
  };

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Thiếu tên môn', 'Nhập tên môn học trước nhé.');
      return;
    }
    if (!newSubjectShort.trim()) {
      Alert.alert('Thiếu viết tắt', 'Nhập tên viết tắt để dễ nhận diện.');
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
    setNewSubjectTargetHours('5');
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

    if (step === 2) {
      if (!validateTime()) return;
      setStep(3);
      return;
    }

    handleSubmit();
  };

  const handleBack = () => {
    setStep((current) => (current > 1 ? ((current - 1) as WizardStep) : current));
  };

  const handleSubmit = () => {
    if (!subjectId) {
      Alert.alert('Chọn môn học', 'Chọn một môn hoặc tạo môn mới.');
      return;
    }
    if (!validateTime()) return;

    const payload = {
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || undefined,
      type,
    };

    if (slotToEdit) {
      updateSlot(slotToEdit.id, payload);
    } else {
      addSlot({
        id: `sc_${Date.now()}`,
        ...payload,
      });

      const store = useFocusStore.getState();
      if (store.tutorialActiveTab === 'Timetable') {
        Alert.alert(
          'Chúc mừng! 🎉',
          'Bạn đã tạo lịch học đầu tiên thành công! Tiếp theo hãy lên kế hoạch công việc cho môn học này nhé.',
          [
            {
              text: 'Tiếp tục',
              onPress: () => {
                onClose();
                store.completeTutorial('Timetable');
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
    if (!slotToEdit) return;

    Alert.alert('Xóa lịch học', 'Bạn muốn xóa tiết học này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          deleteSlot(slotToEdit.id);
          onClose();
        },
      },
    ]);
  };

  const renderStepHeader = () => (
    <View style={styles.stepHeader}>
      <View style={styles.progressRow}>
        {([1, 2, 3] as WizardStep[]).map((item) => {
          const isActive = item === step;
          const isDone = item < step;
          return (
            <View key={item} style={styles.progressItem}>
              <View style={[styles.progressDot, (isActive || isDone) && styles.progressDotActive]}>
                <Text style={[styles.progressDotText, (isActive || isDone) && styles.progressDotTextActive]}>
                  {isDone ? '✓' : item}
                </Text>
              </View>
              {item < 3 && <View style={[styles.progressLine, isDone && styles.progressLineActive]} />}
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
      <TouchableOpacity
        style={[styles.addSubjectCard, showSubjectForm && styles.addSubjectCardActive]}
        onPress={() => setShowSubjectForm((value) => !value)}
        activeOpacity={0.84}
      >
        <View style={styles.addSubjectIcon}>
          <Ionicons name={showSubjectForm ? 'close' : 'add'} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.addSubjectTextWrap}>
          <Text style={styles.addSubjectTitle}>{showSubjectForm ? 'Đóng form thêm môn' : 'Thêm môn học mới'}</Text>
          <Text style={styles.addSubjectDesc}>Dùng khi môn chưa có trong danh sách.</Text>
        </View>
      </TouchableOpacity>

      {showSubjectForm && (
        <View style={styles.subjectFormCard}>
          <TextInput
            style={styles.input}
            placeholder="Tên môn học"
            placeholderTextColor={COLORS.textMuted}
            value={newSubjectName}
            onChangeText={setNewSubjectName}
          />
          <TextInput
            style={styles.input}
            placeholder="Viết tắt"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={6}
            value={newSubjectShort}
            onChangeText={setNewSubjectShort}
          />
          <TextInput
            style={styles.input}
            placeholder="Mục tiêu tự học hằng tuần (vd: 6 giờ)"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={newSubjectTargetHours}
            onChangeText={setNewSubjectTargetHours}
          />
          <View style={styles.colorRow}>
            {SUBJECT_COLOR_SWATCHES.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  newSubjectColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setNewSubjectColor(color)}
                activeOpacity={0.8}
              >
                {newSubjectColor === color && <View style={styles.colorInner} />}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.createSubjectButton} onPress={handleCreateSubject} activeOpacity={0.84}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.createSubjectText}>Tạo và chọn môn này</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionLabel}>Môn đã có</Text>
      <View style={styles.subjectGrid}>
        {subjects.map((subject) => {
          const isSelected = subjectId === subject.id;
          return (
            <TouchableOpacity
              key={subject.id}
              style={[styles.subjectCard, isSelected && { borderColor: subject.color, backgroundColor: subject.color + '12' }]}
              onPress={() => setSubjectId(subject.id)}
              activeOpacity={0.84}
            >
              <View style={[styles.subjectInitials, { backgroundColor: subject.color }]}> 
                <Text style={styles.subjectInitialsText}>{subject.shortName}</Text>
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                <Text style={styles.subjectMeta}>{subject.shortName}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={subject.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTimeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionLabel}>Chọn thứ</Text>
      <View style={styles.daysRow}>
        {DAYS.map((day) => {
          const isSelected = dayOfWeek === day.key;
          return (
            <TouchableOpacity
              key={day.key}
              style={[styles.dayButton, isSelected && styles.dayButtonActive]}
              onPress={() => setDayOfWeek(day.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeInputGroup}>
          <Text style={styles.label}>Bắt đầu</Text>
          <TextInput
            style={styles.input}
            placeholder="07:30"
            placeholderTextColor={COLORS.textMuted}
            value={startTime}
            onChangeText={setStartTime}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.timeInputGroup}>
          <Text style={styles.label}>Kết thúc</Text>
          <TextInput
            style={styles.input}
            placeholder="09:10"
            placeholderTextColor={COLORS.textMuted}
            value={endTime}
            onChangeText={setEndTime}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Địa điểm</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: A1-301, thư viện"
          placeholderTextColor={COLORS.textMuted}
          value={room}
          onChangeText={setRoom}
        />
      </View>
    </View>
  );

  const renderTypeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Lịch học</Text>
        <Text style={styles.summaryTitle}>{selectedSubject?.name ?? 'Chưa chọn môn'}</Text>
        <Text style={styles.summaryMeta}>
          {selectedDay?.fullLabel} • {startTime}-{endTime}{room.trim() ? ` • ${room.trim()}` : ''}
        </Text>
      </View>

      <View style={styles.typeList}>
        {TYPES.map((item) => {
          const isSelected = type === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.typeCard, isSelected && { borderColor: item.color, backgroundColor: item.color + '12' }]}
              onPress={() => setType(item.key)}
              activeOpacity={0.84}
            >
              <View style={[styles.typeIcon, { backgroundColor: item.color + '20' }]}> 
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.typeLabel}>{item.label}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={item.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={slotToEdit ? 'Sửa lịch học' : 'Thêm lịch học'}
      fullScreen={true}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        {tutorialActiveTab === 'Timetable' ? (
          <View style={{ marginBottom: 12 }}>
            {step === 1 && (
              <TutorialTooltip
                step={1}
                totalSteps={3}
                title="Chọn môn học"
                description="Hãy chọn một môn học có sẵn trong danh sách (hoặc tạo môn mới ở trên), sau đó bấm Tiếp tục."
                hideNext={true}
                onSkip={() => useFocusStore.getState().skipTutorial()}
              />
            )}
            {step === 2 && (
              <TutorialTooltip
                step={2}
                totalSteps={3}
                title="Thời gian học"
                description="Thiết lập thứ học, giờ học và địa điểm học tập của bạn, sau đó bấm Tiếp tục."
                hideNext={true}
                onSkip={() => useFocusStore.getState().skipTutorial()}
              />
            )}
            {step === 3 && (
              <TutorialTooltip
                step={3}
                totalSteps={3}
                title="Loại tiết học"
                description="Chọn kiểu học tập phù hợp và bấm Lưu lịch học để hoàn tất."
                hideNext={true}
                onSkip={() => useFocusStore.getState().skipTutorial()}
              />
            )}
          </View>
        ) : (
          renderStepHeader()
        )}
        {step === 1 && renderSubjectStep()}
        {step === 2 && renderTimeStep()}
        {step === 3 && renderTypeStep()}

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textSecondary} />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.84}>
            <Text style={styles.nextButtonText}>{step === 3 ? 'Lưu lịch học' : 'Tiếp tục'}</Text>
            <Ionicons name={step === 3 ? 'checkmark' : 'arrow-forward'} size={17} color="#fff" />
          </TouchableOpacity>
        </View>

        {slotToEdit && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={styles.deleteButtonText}>Xóa lịch học</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: SPACING.md,
    paddingBottom: 20,
  },
  stepHeader: {
    gap: 6,
    paddingBottom: SPACING.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    gap: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  addSubjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '35',
    backgroundColor: COLORS.primary + '10',
  },
  addSubjectCardActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  addSubjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  addSubjectTextWrap: {
    flex: 1,
  },
  addSubjectTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  addSubjectDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subjectFormCard: {
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    paddingVertical: 11,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: COLORS.textPrimary,
  },
  colorInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  createSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  createSubjectText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  subjectGrid: {
    gap: SPACING.sm,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  subjectInitials: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subjectInitialsText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  subjectInfo: {
    flex: 1,
    minWidth: 0,
  },
  subjectName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  subjectMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dayButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  dayTextActive: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeInputGroup: {
    flex: 1,
    gap: 6,
  },
  summaryCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  summaryMeta: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  typeList: {
    gap: SPACING.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: 13,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    ...SHADOW.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.danger + '12',
    borderWidth: 1,
    borderColor: COLORS.danger + '35',
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
