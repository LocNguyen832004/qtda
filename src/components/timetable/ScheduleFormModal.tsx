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
import { useScheduleStore, useSubjectStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

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

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 1, label: 'T2' },
  { key: 2, label: 'T3' },
  { key: 3, label: 'T4' },
  { key: 4, label: 'T5' },
  { key: 5, label: 'T6' },
  { key: 6, label: 'T7' },
  { key: 0, label: 'CN' },
];

const TYPES: { key: ScheduleSlot['type']; label: string; color: string }[] = [
  { key: 'lecture', label: 'Lý thuyết', color: COLORS.primary },
  { key: 'lab', label: 'Thực hành', color: COLORS.secondary },
  { key: 'tutorial', label: 'Bài tập', color: COLORS.accent },
  { key: 'self_study', label: 'Tự học', color: COLORS.success },
  { key: 'group_study', label: 'Học nhóm', color: '#8B85FF' },
];

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  visible,
  onClose,
  slotToEdit,
  defaultDay = 1,
}) => {
  const { addSlot, updateSlot, deleteSlot } = useScheduleStore();
  const { subjects, addSubject } = useSubjectStore();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:10');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<ScheduleSlot['type']>('lecture');

  // Inline subject creation
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectShort, setNewSubjectShort] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState<SubjectColor | string>('#6C63FF');

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible, slotToEdit, defaultDay, subjects]);

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ đề');
      return;
    }
    if (!newSubjectShort.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên viết tắt');
      return;
    }
    const newId = `s_${Date.now()}`;
    const newSubject: Subject = {
      id: newId,
      name: newSubjectName.trim(),
      shortName: newSubjectShort.trim().toUpperCase(),
      studiedHours: 0,
      color: newSubjectColor as SubjectColor,
    };
    addSubject(newSubject);
    setSubjectId(newId);
    setShowSubjectForm(false);
    setNewSubjectName('');
    setNewSubjectShort('');
    setNewSubjectColor('#6C63FF');
  };

  const handleSubmit = () => {
    if (!subjectId) {
      Alert.alert('Lỗi', 'Vui lòng chọn môn học. Hãy tạo môn học trước.');
      return;
    }
    // Time regex validation
    const timeReg = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeReg.test(startTime) || !timeReg.test(endTime)) {
      Alert.alert('Lỗi', 'Thời gian học phải đúng định dạng HH:MM (Ví dụ: 07:30)');
      return;
    }

    if (startTime.localeCompare(endTime) >= 0) {
      Alert.alert('Lỗi', 'Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (slotToEdit) {
      updateSlot(slotToEdit.id, {
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() || undefined,
        type,
      });
    } else {
      const newSlot: ScheduleSlot = {
        id: `sc_${Date.now()}`,
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() || undefined,
        type,
      };
      addSlot(newSlot);
    }
    onClose();
  };

  const handleDelete = () => {
    if (slotToEdit) {
      Alert.alert('Xóa lịch học', 'Bạn có chắc chắn muốn xóa tiết học này khỏi thời khóa biểu?', [
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
    }
  };

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={slotToEdit ? 'Chi tiết lịch học' : 'Thêm lịch học'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
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

        {/* Chọn thứ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thứ trong tuần *</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const isSelected = dayOfWeek === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayBtn, isSelected && styles.dayBtnSelected]}
                  onPress={() => setDayOfWeek(d.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Thời gian học */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Giờ bắt đầu *</Text>
            <TextInput
              style={styles.input}
              placeholder="07:30"
              placeholderTextColor={COLORS.textMuted}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Giờ kết thúc *</Text>
            <TextInput
              style={styles.input}
              placeholder="09:10"
              placeholderTextColor={COLORS.textMuted}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>
        <Text style={styles.helperText}>Nhập giờ theo mẫu 24 giờ, ví dụ 07:30 hoặc 13:45.</Text>

        {/* Phòng học */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phòng học / Địa điểm</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: A1-301, Lab IT-01, Thư viện"
            placeholderTextColor={COLORS.textMuted}
            value={room}
            onChangeText={setRoom}
          />
        </View>

        {/* Loại tiết học */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại tiết học</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => {
              const isSelected = type === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.typeBtn,
                    isSelected && { backgroundColor: t.color, borderColor: t.color },
                  ]}
                  onPress={() => setType(t.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeBtnText, isSelected && { color: '#fff' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionRow}>
          {slotToEdit && (
            <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.btnDeleteText}>Xóa</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btnSubmit, slotToEdit ? { flex: 2 } : { flex: 1 }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
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
  form: {
    gap: 12,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  helperText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: -6,
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  dayBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  typeBtnText: {
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
});
