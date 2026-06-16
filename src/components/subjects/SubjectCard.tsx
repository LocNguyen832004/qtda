import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../utils/theme';
import { ProgressBar } from '../ui/ProgressBar';

interface SubjectCardProps {
  subject: Subject;
  studiedThisWeek?: number; // hours
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, studiedThisWeek = 0 }) => {
  const targetHrs = subject.targetHours || 5;
  const progress = Math.min(1, studiedThisWeek / Math.max(1, targetHrs));

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: subject.color + '20' }]}>
        <Text style={[styles.initials, { color: subject.color }]}>{subject.shortName}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{subject.name}</Text>
        </View>
        <View style={styles.progressRow}>
          <ProgressBar progress={progress} color={subject.color} height={5} style={{ flex: 1 }} />
          <Text style={styles.hoursText}>{studiedThisWeek}h / {targetHrs}h mục tiêu</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
  info: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  hoursText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium, flexShrink: 0 },
});
