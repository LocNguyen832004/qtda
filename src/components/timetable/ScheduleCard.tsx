import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScheduleSlot } from '../../types';
import { useSubjectStore } from '../../store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleCardProps {
  slot: ScheduleSlot;
}

const TYPE_LABEL: Record<string, string> = {
  lecture: 'Lý thuyết',
  lab: 'Thực hành',
  tutorial: 'Bài tập',
  self_study: 'Tự học',
  group_study: 'Học nhóm',
};

const TYPE_ICON: Record<string, string> = {
  lecture: 'book-outline',
  lab: 'flask-outline',
  tutorial: 'pencil-outline',
  self_study: 'person-outline',
  group_study: 'people-outline',
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ slot }) => {
  const getSubjectById = useSubjectStore((s) => s.getSubjectById);
  const subject = getSubjectById(slot.subjectId);
  const color = subject?.color ?? COLORS.primary;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{slot.startTime}</Text>
        <View style={styles.timeLine} />
        <Text style={[styles.time, { color: COLORS.textMuted }]}>{slot.endTime}</Text>
      </View>
      <View style={[styles.body, { backgroundColor: color + '12' }]}>
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.subjectName} numberOfLines={1}>{subject?.name ?? '—'}</Text>
          <View style={[styles.typeBadge, { backgroundColor: color + '25' }]}>
            <Ionicons name={TYPE_ICON[slot.type] as any} size={10} color={color} />
            <Text style={[styles.typeText, { color }]}>{TYPE_LABEL[slot.type]}</Text>
          </View>
        </View>
        {slot.room && (
          <View style={styles.roomRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.room}>{slot.room}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderLeftWidth: 3,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  timeCol: {
    width: 48,
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 4,
    backgroundColor: COLORS.surface,
  },
  time: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textSecondary },
  timeLine: { flex: 1, width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  body: { flex: 1, padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  subjectName: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 2 },
  typeText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  room: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
