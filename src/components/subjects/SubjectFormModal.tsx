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
import { Subject, SubjectColor } from '../../types';
import { useSubjectStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';

interface SubjectFormModalProps {
  visible: boolean;
  onClose: () => void;
  subjectToEdit?: Subject;
}

const COLOR_SWATCHES: SubjectColor[] = [
  '#6C63FF',
  '#FF6584',
  '#43BCCD',
  '#F9A826',
  '#56C271',
  '#E8724A',
];

interface SubjectFormContentProps {
  subjectToEdit?: Subject;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SubjectFormContent: React.FC<SubjectFormContentProps> = ({
  subjectToEdit,
  onSuccess,
  onCancel,
}) => {
  const { addSubject, updateSubject } = useSubjectStore();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [color, setColor] = useState<SubjectColor | string>('#6C63FF');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setShortName(subjectToEdit.shortName);
      setTargetHours(subjectToEdit.targetHours ? String(subjectToEdit.targetHours) : '');
      setColor(subjectToEdit.color);
    } else {
      setName('');
      setShortName('');
      setTargetHours('');
      setColor('#6C63FF');
    }
  }, [subjectToEdit]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ đề');
      return;
    }
    if (!shortName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên viết tắt');
      return;
    }

    const targetHoursNum = targetHours ? parseFloat(targetHours) : undefined;

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        targetHours: targetHoursNum,
        color,
      });
    } else {
      const newSubject: Subject = {
        id: `s_${Date.now()}`,
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        targetHours: targetHoursNum,
        studiedHours: 0,
        color,
      };
      addSubject(newSubject);
    }
    onSuccess();
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
      {/* Tên chủ đề */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên chủ đề học *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Thiết kế đồ họa, Học Tiếng Anh"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Viết tắt */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên viết tắt *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: GD, ENG (tối đa 6 ký tự)"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="characters"
          maxLength={6}
          value={shortName}
          onChangeText={setShortName}
        />
      </View>

      {/* Target Hours */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mục tiêu tự học hàng tuần (giờ)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 6"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={targetHours}
          onChangeText={setTargetHours}
        />
      </View>

      {/* Color picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Màu đại diện</Text>
        <View style={styles.colorRow}>
          {COLOR_SWATCHES.map((c) => {
            const isSelected = color === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  isSelected && styles.colorCircleSelected,
                ]}
                onPress={() => setColor(c)}
                activeOpacity={0.8}
              >
                {isSelected && <View style={styles.innerCircle} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity
          style={[styles.btnSubmit, { flex: 1, backgroundColor: COLORS.borderLight }]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, { color: COLORS.textSecondary }]}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSubmit, { flex: 1 }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  visible,
  onClose,
  subjectToEdit,
}) => {
  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={subjectToEdit ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}
    >
      <SubjectFormContent
        subjectToEdit={subjectToEdit}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
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
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  btnSubmit: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
});
