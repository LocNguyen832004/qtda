import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, SHADOW } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStartScreenProps {
  onStart: () => void;
}

export const OnboardingStartScreen: React.FC<OnboardingStartScreenProps> = ({ onStart }) => {
  const [slide, setSlide] = useState<1 | 2>(1);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, '#8B85FF']}
        style={styles.gradient}
      >
        {/* Background decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        {slide === 1 ? (
          /* SLIDE 1: GIỚI THIỆU */
          <View style={styles.content}>
            {/* Logo / Icon Area */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="timer" size={64} color={COLORS.primary} />
              </View>
              <View style={styles.sparkleBadge}>
                <Ionicons name="sparkles" size={16} color="#FFD700" />
              </View>
            </View>

            {/* Texts */}
            <View style={styles.textContainer}>
              <Text style={styles.appTitle}>Kỷ Luật Học Tập</Text>
              <Text style={styles.tagline}>Lên kế hoạch • Tập trung học • Theo dõi tiến bộ</Text>
              <Text style={styles.description}>
                Ứng dụng giúp bạn tạo môn học, chia nhỏ việc cần làm và bắt đầu các phiên tập trung có điểm thưởng rõ ràng.
              </Text>
            </View>

            {/* Quick Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text style={styles.infoText}>Lịch học</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkbox-outline" size={20} color="#fff" />
                <Text style={styles.infoText}>Công việc</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="star-outline" size={20} color="#fff" />
                <Text style={styles.infoText}>Điểm thưởng</Text>
              </View>
            </View>

            {/* Button CTA */}
            <TouchableOpacity
              style={styles.btnStart}
              onPress={() => setSlide(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnStartText}>Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        ) : (
          /* SLIDE 2: CÁC BƯỚC KHỞI ĐẦU */
          <View style={styles.content}>
            {/* Header row with back arrow */}
            <View style={styles.slide2Header}>
              <TouchableOpacity onPress={() => setSlide(1)} style={styles.btnBackArrow} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.slide2HeaderTitle}>Cách bắt đầu học</Text>
              <View style={{ width: 22 }} />
            </View>

            {/* Steps Container */}
            <View style={styles.stepsContainer}>
              {/* Step 1 */}
              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepTextTitle}>Tạo môn học mới</Text>
                  <Text style={styles.stepTextDesc}>Đặt tên, viết tắt và màu riêng để nhận diện nhanh.</Text>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepTextTitle}>Tạo công việc cụ thể</Text>
                  <Text style={styles.stepTextDesc}>Ghi việc cần làm và ước lượng số phiên tập trung.</Text>
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepTextContent}>
                  <Text style={styles.stepTextTitle}>Chọn việc rồi bắt đầu</Text>
                  <Text style={styles.stepTextDesc}>Chọn một công việc, học theo đồng hồ và nhận điểm khi hoàn thành.</Text>
                </View>
              </View>
            </View>

            {/* Note text */}
            <Text style={styles.noteText}>
              Màn hình Tập trung sẽ hướng dẫn bạn tạo dữ liệu đầu tiên.
            </Text>

            {/* Button CTA */}
            <TouchableOpacity
              style={styles.btnStart}
              onPress={onStart}
              activeOpacity={0.85}
            >
              <Text style={styles.btnStartText}>Bắt đầu ngay</Text>
              <Ionicons name="rocket-outline" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  circle1: {
    width: 250,
    height: 250,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -80,
    left: -80,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: SCREEN_HEIGHT * 0.75,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    position: 'relative',
    marginTop: 20,
    ...SHADOW.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.xs,
    marginTop: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: FONT_WEIGHT.medium,
  },
  btnStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    width: '100%',
    ...SHADOW.md,
  },
  btnStartText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  /* SLIDE 2 STYLES */
  slide2Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  btnBackArrow: {
    padding: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  slide2HeaderTitle: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    color: '#fff',
  },
  stepsContainer: {
    width: '100%',
    gap: 20,
    marginVertical: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  stepTextContent: {
    flex: 1,
  },
  stepTextTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#fff',
  },
  stepTextDesc: {
    fontSize: FONT_SIZE.xs + 1,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 18,
    marginTop: 4,
  },
  noteText: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
});
