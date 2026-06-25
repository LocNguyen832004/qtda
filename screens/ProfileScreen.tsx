import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusStore, useTaskStore, useSubjectStore, useScheduleStore } from '../src/store';
import { ModalContainer } from '../src/components/ui/ModalContainer';
import { TutorialTooltip } from '../src/components/ui/TutorialTooltip';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../src/utils/theme';
import { TouchableScale } from '../src/components/ui/TouchableScale';
import { dateToString } from '../src/utils/dateUtils';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { MUSIC_TRACKS, MusicTrack } from '../src/hooks/useAudioPlayer';
import { supabase } from '../src/lib/supabase';

const MODE_EMOJI: Record<string, string> = {
  pomodoro: '⏱️',
  short_break: '☕',
  long_break: '🥤',
};

const MODE_LABEL: Record<string, string> = {
  pomodoro: 'Phiên học',
  short_break: 'Nghỉ ngắn',
  long_break: 'Nghỉ dài',
};

const REASON_LABEL: Record<string, string> = {
  tab_switch: 'Chuyển màn hình',
  back_button: 'Bấm quay lại',
  app_background: 'Thoát ứng dụng',
};

const formatTime = (ts: string) => {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatElapsed = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}p${sec}s`;
};

const MUSIC_SHOP_ITEMS: MusicTrack[] = MUSIC_TRACKS;

export default function ProfileScreen() {
  const { totalPoints, sessions, unlockedMusicIds, unlockMusic, abandonLogs, tutorialActiveTab, tutorialActiveStep } = useFocusStore();
  const { tasks } = useTaskStore();
  const { subjects } = useSubjectStore();

  const [username, setUsername] = useState('Người học chăm chỉ');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Auto scroll khi tutorial chạy
  useEffect(() => {
    if (tutorialActiveTab === 'Profile' && tutorialActiveStep !== null) {
      setTimeout(() => {
        if (tutorialActiveStep === 1) {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        } else if (tutorialActiveStep === 2) {
          scrollRef.current?.scrollTo({ y: 220, animated: true });
        }
      }, 100);
    }
  }, [tutorialActiveTab, tutorialActiveStep]);

  const handleResetApp = () => {
    Alert.alert(
      '⚠️ Xóa toàn bộ dữ liệu?',
      'Hành động này sẽ xóa sạch tất cả môn học, lịch học, công việc và điểm đã tích lũy. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: () => {
            useSubjectStore.getState().reset();
            useTaskStore.getState().reset();
            useScheduleStore.getState().reset();
            useFocusStore.getState().reset();
            setSettingsVisible(false);
            Alert.alert('Thành công', 'Đã xóa dữ liệu và đưa ứng dụng về trạng thái ban đầu.');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    setSettingsVisible(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Loi dang xuat', error.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xoa tai khoan vinh vien',
      'Tai khoan va toan bo du lieu tren he thong se bi xoa. Hanh dong nay khong the hoan tac.',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Xoa tai khoan',
          style: 'destructive',
          onPress: async () => {
            setSettingsVisible(false);
            const { error } = await supabase.rpc('delete_user_account');
            if (error) {
              Alert.alert(
                'Chua xoa duoc tai khoan',
                'Supabase can co RPC delete_user_account. Hay chay SQL moi trong sql/supabase_schema.sql roi thu lai. Chi tiet: ' + error.message
              );
              return;
            }

            useSubjectStore.getState().reset();
            useTaskStore.getState().reset();
            useScheduleStore.getState().reset();
            useFocusStore.getState().reset();
            await supabase.auth.signOut();
            Alert.alert('Da xoa tai khoan', 'Tai khoan cua ban da duoc xoa vinh vien.');
          }
        }
      ]
    );
  };

  const rankInfo = useMemo(() => {
    if (totalPoints < 100) {
      return {
        title: 'Tập sự Học tập 🎓',
        color: '#9CA3AF',
        min: 0,
        max: 100,
        gradient: ['#9CA3AF', '#6B7280'] as [string, string],
      };
    } else if (totalPoints < 300) {
      return {
        title: 'Chiến binh Tập trung 🛡️',
        color: '#43BCCD',
        min: 100,
        max: 300,
        gradient: ['#43BCCD', '#6C63FF'] as [string, string],
      };
    } else if (totalPoints < 700) {
      return {
        title: 'Chuyên gia Tập trung 🎓',
        color: '#F9A826',
        min: 300,
        max: 700,
        gradient: ['#F9A826', '#E8724A'] as [string, string],
      };
    } else {
      return {
        title: 'Bậc thầy Tập trung 🏆',
        color: '#FF6584',
        min: 700,
        max: 9999,
        gradient: ['#FF6584', '#FF8E53'] as [string, string],
      };
    }
  }, [totalPoints]);

  const levelProgress = useMemo(() => {
    if (rankInfo.max === 9999) return 1;
    const numerator = totalPoints - rankInfo.min;
    const denominator = rankInfo.max - rankInfo.min;
    return Math.min(1, Math.max(0, numerator / denominator));
  }, [totalPoints, rankInfo]);

  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const totalPomodoros = useMemo(
    () => sessions.filter((s) => s.completed && s.sessionType === 'pomodoro').length,
    [sessions]
  );

  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = dateToString(d);
      const hasFocus = sessions.some((s) => s.date === ds && s.completed);
      if (hasFocus) streak++;
      else break;
    }
    return streak;
  }, [sessions]);

  // ─── Event Handlers ───────────────────────────────────────────────────────────
  const handleStartEditName = () => {
    setTempName(username);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleUnlockMusic = (item: MusicTrack) => {
    const isUnlocked = unlockedMusicIds.includes(item.id);
    if (isUnlocked) {
      Alert.alert(
        'Đã mở khóa',
        `Bạn có thể chọn "${item.name}" trong màn hình tập trung khi bắt đầu phiên học.`
      );
      return;
    }

    if (totalPoints < item.cost) {
      Alert.alert(
        'Không đủ điểm',
        `Bạn cần thêm ${item.cost - totalPoints} điểm để mở khóa bài nhạc này. Hãy hoàn thành thêm phiên tập trung và công việc nhé.`
      );
      return;
    }

    Alert.alert(
      'Mở khóa nhạc',
      `Dùng ${item.cost} điểm để mở khóa "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở khóa',
          onPress: () => {
            const success = unlockMusic(item.id, item.cost, item.name);
            if (success) {
              Alert.alert('Đã mở khóa', `Bạn có thể chọn "${item.name}" trong màn hình tập trung.`);
            } else {
              Alert.alert('Lỗi', 'Đã có lỗi xảy ra, vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { position: 'relative' }]}>
        {tutorialActiveTab === 'Profile' && tutorialActiveStep !== null && (
          <View pointerEvents="none" style={styles.tutorialBackdrop} />
        )}
        {/* Header with Title and Settings Gear */}
        <View style={styles.header}>
          <Text style={styles.title}>Cá Nhân</Text>
          <TouchableOpacity 
            style={styles.settingsIcon} 
            onPress={() => setSettingsVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={(tutorialActiveTab === 'Profile' && tutorialActiveStep !== null) ? { zIndex: 1001 } : undefined}>
            {/* User Card */}
            <View style={[
              styles.profileCard,
              (tutorialActiveTab === 'Profile' && tutorialActiveStep === 1) && { zIndex: 1001, borderColor: COLORS.primary, borderWidth: 2, ...SHADOW.lg }
            ]}>
              <LinearGradient colors={rankInfo.gradient} style={styles.avatarGradient}>
                <Ionicons name="person" size={42} color="#fff" />
              </LinearGradient>

              <View style={styles.profileInfo}>
                {isEditingName ? (
                  <View style={styles.editNameRow}>
                    <TextInput
                      style={styles.nameInput}
                      value={tempName}
                      onChangeText={setTempName}
                      maxLength={20}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleSaveName} style={styles.saveNameBtn}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.nameRow}>
                    <Text style={styles.username}>{username}</Text>
                    <TouchableOpacity onPress={handleStartEditName} style={styles.editBtn}>
                      <Ionicons name="create-outline" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={[styles.rankBadgeText, { color: rankInfo.color }]}>
                  {rankInfo.title}
                </Text>
              </View>
            </View>

            {/* Tooltip Step 1 */}
            {tutorialActiveTab === 'Profile' && tutorialActiveStep === 1 && (
              <View style={{ zIndex: 1001, marginTop: -8, marginBottom: 12 }}>
                <TutorialTooltip
                  step={1}
                  totalSteps={2}
                  title="Hồ sơ"
                  description="Xem tiến độ học tập."
                  onNext={() => useFocusStore.getState().nextTutorialStep()}
                  onSkip={() => useFocusStore.getState().skipTutorial()}
                  arrowPosition="top"
                />
              </View>
            )}

            {/* Level Progress */}
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelLabel}>Tiến trình cấp bậc</Text>
                <Text style={styles.levelVal}>
                  {totalPoints} / {rankInfo.max === 9999 ? 'MAX' : `${rankInfo.max} điểm`}
                </Text>
              </View>
              <ProgressBar progress={levelProgress} color={rankInfo.color} height={8} />
              {rankInfo.max !== 9999 && (
                <Text style={styles.levelSubText}>
                  Cần thêm {rankInfo.max - totalPoints} điểm để đạt cấp tiếp theo.
                </Text>
              )}
            </View>

            {/* Stats Overview */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBox, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="star" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.statNum}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Điểm tích lũy</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconBox, { backgroundColor: COLORS.danger + '15' }]}>
                  <Ionicons name="time" size={20} color={COLORS.danger} />
                </View>
                <Text style={styles.statNum}>{totalPomodoros}</Text>
                <Text style={styles.statLabel}>Phiên học</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconBox, { backgroundColor: COLORS.success + '15' }]}>
                  <Ionicons name="checkbox" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.statNum}>{completedTasks}</Text>
                <Text style={styles.statLabel}>Công việc xong</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconBox, { backgroundColor: '#F9A82615' }]}>
                  <Ionicons name="flame" size={20} color="#F9A826" />
                </View>
                <Text style={styles.statNum}>{streakDays}</Text>
                <Text style={styles.statLabel}>Ngày học chuỗi</Text>
              </View>
            </View>

            {/* Tomato shop */}
            <View style={[
              styles.shopSection,
              (tutorialActiveTab === 'Profile' && tutorialActiveStep === 2) && { zIndex: 1001, borderColor: COLORS.primary, borderWidth: 2, ...SHADOW.lg }
            ]}>
              <View style={styles.shopTitleRow}>
                <Ionicons name="storefront-outline" size={20} color={COLORS.primary} />
                <Text style={styles.shopSectionTitle}>Cửa hàng nhạc nền</Text>
              </View>

              {/* Tooltip Step 2 */}
              {tutorialActiveTab === 'Profile' && tutorialActiveStep === 2 && (
                <View style={{ marginBottom: 16 }}>
                  <TutorialTooltip
                    step={2}
                    totalSteps={2}
                    title="Nhạc nền"
                    description="Dùng điểm để mở nhạc mới."
                    onNext={() => useFocusStore.getState().nextTutorialStep()}
                    onPrev={() => useFocusStore.getState().prevTutorialStep()}
                    onSkip={() => useFocusStore.getState().skipTutorial()}
                    arrowPosition="top"
                  />
                </View>
              )}
              <Text style={styles.shopSubtitle}>
                Late Afternoon Study được mở sẵn. Mỗi bài còn lại cần 100 điểm để mở khóa và chọn trong phiên tập trung.
              </Text>

              {MUSIC_SHOP_ITEMS.map((item) => {
                const isUnlocked = unlockedMusicIds.includes(item.id);
                return (
                  <TouchableScale
                    key={item.id}
                    style={[styles.shopItemCard, isUnlocked && styles.shopItemUnlocked]}
                    onPress={() => handleUnlockMusic(item)}
                    activeScale={0.98}
                  >
                    <View style={[styles.shopIconContainer, { backgroundColor: isUnlocked ? COLORS.success + '12' : COLORS.primary + '12' }]}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={isUnlocked ? COLORS.success : COLORS.primary}
                      />
                    </View>

                    <View style={styles.shopItemDetails}>
                      <Text style={styles.shopItemName}>{item.name}</Text>
                      <Text style={styles.shopItemDesc}>{item.description}</Text>
                    </View>

                    <View style={styles.shopActionColumn}>
                      {isUnlocked ? (
                        <View style={styles.unlockedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                          <Text style={styles.unlockedText}>Đã có</Text>
                        </View>
                      ) : (
                        <View style={styles.buyBadge}>
                          <Text style={styles.buyActionText}>Mở khóa</Text>
                          <Text style={styles.buyCostText}>{item.cost} điểm</Text>
                        </View>
                      )}
                    </View>
                  </TouchableScale>
                );
              })}
            </View>
          </View>
      </ScrollView>

      {/* Settings Modal */}
      <ModalContainer
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        title="Cài đặt hệ thống"
      >
        <View style={styles.settingsForm}>
          <Text style={styles.settingsSubtitle}>
            Công cụ kiểm thử trong giai đoạn phát triển: đặt lại hướng dẫn hoặc dữ liệu app.
          </Text>

          <TouchableOpacity 
            style={styles.btnResetTutorials} 
            onPress={() => {
              useFocusStore.getState().resetTutorials();
              setSettingsVisible(false);
              Alert.alert('Thành công', 'Đã đặt lại hướng dẫn. Hãy chuyển qua các tab để xem lại từ đầu.');
            }} 
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.btnResetTutorialsText}>Đặt lại hướng dẫn (test)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnResetData} onPress={handleResetApp} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={styles.btnResetDataText}>Đặt lại dữ liệu app (test)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnResetData, { borderColor: COLORS.textSecondary, backgroundColor: COLORS.textSecondary + '15', marginTop: 12 }]} 
            onPress={handleLogout} 
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.textSecondary} />
            <Text style={[styles.btnResetDataText, { color: COLORS.textSecondary }]}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnResetData, { borderColor: 'transparent', backgroundColor: 'transparent', marginTop: 12 }]} 
            onPress={handleDeleteAccount} 
            activeOpacity={0.8}
          >
            <Text style={[styles.btnResetDataText, { color: COLORS.danger, textDecorationLine: 'underline', fontSize: FONT_SIZE.sm }]}>
              Xóa tài khoản vĩnh viễn
            </Text>
          </TouchableOpacity>
        </View>
      </ModalContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  settingsForm: {
    gap: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  settingsSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  btnResetData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.danger + '15',
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  btnResetDataText: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  btnResetTutorials: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 12,
  },
  btnResetTutorialsText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  tutorialBackdrop: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(10, 11, 22, 0.72)',
    zIndex: 1000,
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    gap: 16,
    ...SHADOW.sm,
    marginBottom: SPACING.md,
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  editBtn: {
    padding: 4,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
    paddingBottom: 2,
    marginRight: 20,
  },
  nameInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    padding: 0,
  },
  saveNameBtn: {
    padding: 2,
  },
  rankBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: 4,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
    gap: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  levelVal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  levelSubText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    ...SHADOW.sm,
    gap: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNum: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  shopSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    ...SHADOW.sm,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  shopSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  shopSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 16,
  },
  shopItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    gap: 12,
    marginBottom: SPACING.sm,
  },
  shopItemUnlocked: {
    borderColor: COLORS.success + '30',
    backgroundColor: COLORS.success + '03',
  },
  shopIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopItemDetails: {
    flex: 1,
    gap: 3,
  },
  shopItemName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  shopItemDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  shopActionColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  unlockedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.bold,
  },
  buyBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  buyActionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 12,
  },
  buyCostText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 12,
  },

  // ─── Stats Styles ────────────────────────────────────────────────────────────
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardValue: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 6 },
  chartCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartLabel: { fontSize: 9, color: COLORS.textMuted },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: COLORS.borderLight, borderRadius: RADIUS.sm, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: RADIUS.sm },
  dayLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  pomodoroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 8 },
  tomatoDot: { width: 20, height: 20, borderRadius: 10 },
  moreText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, alignSelf: 'center' },
  pomodoroTotal: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  subjectList: { gap: 10, marginTop: 4 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectColor: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { width: 42, fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  barWrap: { flex: 1, height: 8, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  subjectBar: { height: '100%', borderRadius: RADIUS.full },
  subjectMin: { width: 36, fontSize: FONT_SIZE.xs, color: COLORS.textMuted, textAlign: 'right' },
  emptyStatsText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center' },
  // Abandon styles
  abandonList: { gap: 10, marginTop: 4 },
  abandonRow: { flexDirection: 'row', borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  abandonAccent: { width: 4 },
  abandonContent: { flex: 1, padding: 10, gap: 5 },
  abandonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  abandonMode: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  penaltyText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  abandonTime: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  abandonMid: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
  abandonReason: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  progressTrack: { height: 4, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  abandonStat: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
