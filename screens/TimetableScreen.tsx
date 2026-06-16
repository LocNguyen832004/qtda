import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView
} from 'react-native';
import { ScheduleCard } from '../src/components/timetable/ScheduleCard';
import { ScheduleFormModal } from '../src/components/timetable/ScheduleFormModal';
import { TouchableScale } from '../src/components/ui/TouchableScale';
import { FadeInView } from '../src/components/ui/FadeInView';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { getDayName, getWeekDates, isSameDate, shortDateLabel } from '../src/utils/dateUtils';
import { useScheduleStore, useFocusStore } from '../src/store';
import { DayOfWeek, ScheduleSlot } from '../src/types';
import { Ionicons } from '@expo/vector-icons';
import { TutorialTooltip } from '../src/components/ui/TutorialTooltip';

export default function TimetableScreen() {
  const weekDates = useMemo(() => getWeekDates(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(
    weekDates.find((d) => isSameDate(d, new Date())) ?? weekDates[0]
  );
 
  const { slots } = useScheduleStore();
  const { tutorialActiveTab, tutorialActiveStep } = useFocusStore();
  const dayOfWeek = selectedDate.getDay() as DayOfWeek;
  const filteredSlots = useMemo(
    () => slots.filter((s) => s.dayOfWeek === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, dayOfWeek]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | undefined>(undefined);

  const handleOpenAdd = () => {
    setSelectedSlot(undefined);
    setModalVisible(true);
  };

  const handleOpenEdit = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Thời Khoá Biểu</Text>
        <Text style={styles.subtitle}>Tuần này</Text>
      </View>

      {/* Week day picker */}
      <View style={[
        styles.weekStrip,
        (tutorialActiveTab === 'Timetable' && tutorialActiveStep === 1) && { zIndex: 1001, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, ...SHADOW.lg }
      ]}>
        {weekDates.map((date, i) => {
          const isSelected = isSameDate(date, selectedDate);
          const isToday = isSameDate(date, new Date());
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayBtn, isSelected && styles.dayBtnSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {getDayName(date.getDay())}
              </Text>
              <View style={[styles.dayNum, isSelected && styles.dayNumSelected, isToday && !isSelected && styles.dayNumToday]}>
                <Text style={[styles.dayNumText, isSelected && styles.dayNumTextSelected, isToday && !isSelected && { color: COLORS.primary }]}>
                  {date.getDate()}
                </Text>
              </View>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
 
      {/* Tooltip Step 1 */}
      {tutorialActiveTab === 'Timetable' && tutorialActiveStep === 1 && (
        <View style={{ zIndex: 1001, marginHorizontal: SPACING.md, marginTop: 4 }}>
          <TutorialTooltip
            step={1}
            totalSteps={2}
            title="Thời khóa biểu"
            description="Chọn từng ngày trong tuần để xem lịch học hoặc khung tự học đã lưu."
            onNext={() => useFocusStore.getState().nextTutorialStep()}
            onSkip={() => useFocusStore.getState().skipTutorial()}
            arrowPosition="top"
          />
        </View>
      )}

      {/* Selected day label */}
      <View style={styles.dayHeader}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
        <Text style={styles.dayHeaderText}>{shortDateLabel(selectedDate)}</Text>
        <View style={styles.slotCount}>
          <Text style={styles.slotCountText}>{filteredSlots.length} tiết</Text>
        </View>
      </View>

      {/* Schedule list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredSlots.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="sunny-outline" size={44} color={COLORS.border} />
            <Text style={styles.emptyText}>Không có lịch học</Text>
            <Text style={styles.emptySubtext}>Ngày nghỉ hoặc tự học tại nhà</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handleOpenAdd} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.emptyActionText}>Thêm lịch học</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSlots.map((slot, index) => (
            <FadeInView key={slot.id} delay={index * 60}>
              <TouchableScale
                onPress={() => handleOpenEdit(slot)}
                activeScale={0.97}
              >
                <ScheduleCard slot={slot} />
              </TouchableScale>
            </FadeInView>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button Container */}
      <View style={[
        styles.fabContainer,
        (tutorialActiveTab === 'Timetable' && tutorialActiveStep === 2) && { zIndex: 1001 }
      ]}>
        {tutorialActiveTab === 'Timetable' && tutorialActiveStep === 2 && (
          <View style={styles.fabTooltip}>
            <TutorialTooltip
              step={2}
              totalSteps={2}
              title="Thêm lịch học mới"
              description="Bấm dấu cộng để thêm môn học, ngày học và khung giờ."
              onNext={() => useFocusStore.getState().nextTutorialStep()}
              onPrev={() => useFocusStore.getState().prevTutorialStep()}
              onSkip={() => useFocusStore.getState().skipTutorial()}
              arrowPosition="bottom"
            />
          </View>
        )}
        <TouchableScale 
          style={[
            styles.fab,
            (tutorialActiveTab === 'Timetable' && tutorialActiveStep === 2) && { borderColor: '#fff', borderWidth: 2, ...SHADOW.lg }
          ]} 
          onPress={handleOpenAdd} 
          activeScale={0.9}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableScale>
      </View>

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        slotToEdit={selectedSlot}
        defaultDay={dayOfWeek}
      />
      {/* Tutorial Backdrop Overlay */}
      {tutorialActiveTab === 'Timetable' && tutorialActiveStep !== null && (
        <View pointerEvents="none" style={styles.tutorialBackdrop} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.md, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 },
  weekStrip: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: 4 },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: RADIUS.md },
  dayBtnSelected: { backgroundColor: COLORS.primary },
  dayName: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, color: COLORS.textMuted, marginBottom: 4 },
  dayNameSelected: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayNumSelected: { backgroundColor: 'rgba(255,255,255,0.25)' },
  dayNumToday: { backgroundColor: COLORS.primaryLight + '20' },
  dayNumText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  dayNumTextSelected: { color: '#fff' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 2 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 8, gap: 6 },
  dayHeaderText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary, flex: 1 },
  slotCount: { backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  slotCountText: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
  list: { flex: 1 },
  listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textSecondary },
  emptySubtext: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 22, 0.72)',
    zIndex: 1000,
  },
});
