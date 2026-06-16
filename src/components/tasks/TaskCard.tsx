import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StudyTask } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { useSubjectStore, useFocusStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { TouchableScale } from '../ui/TouchableScale';
import { useNavigation } from '@react-navigation/native';

interface TaskCardProps {
  task: StudyTask;
  onToggle?: (id: string) => void;
  onPress?: (task: StudyTask) => void;
  compact?: boolean;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: COLORS.priorityHigh,
  medium: COLORS.priorityMedium,
  low: COLORS.priorityLow,
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'Cao',
  medium: 'TB',
  low: 'Thấp',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onPress, compact = false }) => {
  const getSubjectById = useSubjectStore((s) => s.getSubjectById);
  const subject = getSubjectById(task.subjectId);
  const isDone = task.status === 'done';

  const navigation = useNavigation<any>();
  const setActiveSubjectId = useFocusStore((s) => s.setActiveSubjectId);
  const setActiveTaskId = useFocusStore((s) => s.setActiveTaskId);

  const handlePress = () => {
    if (onPress) {
      onPress(task);
      return;
    }
    if (isDone) return;
    setActiveSubjectId(task.subjectId);
    setActiveTaskId(task.id);
    navigation.navigate('Focus');
  };

  return (
    <TouchableScale
      onPress={handlePress}
      activeScale={0.97}
      style={[styles.card, isDone && styles.cardDone]}
    >
      <View style={[styles.colorStripe, { backgroundColor: subject?.color ?? COLORS.primary }]} />
      
      <View style={styles.content}>
        <View style={styles.row}>
          {/* Checkbox handler */}
          <TouchableOpacity
            onPress={() => onToggle?.(task.id)}
            style={[styles.checkbox, isDone && { backgroundColor: subject?.color ?? COLORS.primary, borderColor: subject?.color ?? COLORS.primary }]}
            activeOpacity={0.7}
          >
            {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
          </TouchableOpacity>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        {!compact && (
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <View style={[styles.dot, { backgroundColor: subject?.color ?? COLORS.primary }]} />
              <Text style={styles.metaText}>{subject?.shortName ?? '—'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
              <Text style={[styles.metaText, { color: task.dueDate < new Date().toISOString().split('T')[0] && !isDone ? COLORS.danger : COLORS.textMuted }]}>
                {formatDate(task.dueDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{task.actualPomodoros}/{task.estimatedPomodoros} 🍅</Text>
            </View>
            <View style={[styles.priority, { backgroundColor: PRIORITY_COLOR[task.priority] + '22' }]}>
              <Text style={[styles.priorityText, { color: PRIORITY_COLOR[task.priority] }]}>
                {PRIORITY_LABEL[task.priority]}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: { opacity: 0.6 },
  colorStripe: { width: 4 },
  content: { flex: 1, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  dot: { width: 6, height: 6, borderRadius: 3 },
  priority: { borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 2 },
  priorityText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
});
