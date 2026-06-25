import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW } from '../../utils/theme';

interface TutorialTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  arrowPosition?: 'top' | 'bottom';
  hideNext?: boolean;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  totalSteps,
  title,
  description,
  onNext,
  onPrev,
  onSkip,
  arrowPosition = 'top',
  hideNext = false,
}) => {
  return (
    <View style={[styles.container, arrowPosition === 'bottom' ? styles.containerBottom : styles.containerTop]}>
      {arrowPosition === 'top' && <View style={[styles.arrow, styles.arrowTop]} />}
      
      <View style={styles.card}>
        <View style={styles.contentRow}>
          {/* Bong bóng biểu tượng trợ lý */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>💡</Text>
          </View>
          
          <View style={styles.body}>
            {/* Tiêu đề & Nút bỏ qua */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
                <Text style={styles.skipText}>Bỏ qua</Text>
              </TouchableOpacity>
            </View>

            {/* Nội dung hướng dẫn */}
            <Text style={styles.description}>{description}</Text>

            {/* Điều hướng và Tiến trình */}
            <View style={styles.footer}>
              <Text style={styles.stepNum}>Bước {step}/{totalSteps}</Text>
              
              <View style={styles.btnRow}>
                {step > 1 && onPrev && (
                  <TouchableOpacity onPress={onPrev} style={styles.btnBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={11} color={COLORS.textSecondary} />
                    <Text style={styles.btnBackText}>Quay lại</Text>
                  </TouchableOpacity>
                )}
                
                {!hideNext && onNext && (
                  <TouchableOpacity onPress={onNext} style={styles.btnNext} activeOpacity={0.8}>
                    <Text style={styles.btnNextText}>
                      {step === totalSteps ? 'Xong' : 'Tiếp tục'}
                    </Text>
                    <Ionicons
                      name={step === totalSteps ? 'checkmark' : 'arrow-forward'}
                      size={11}
                      color="#fff"
                      style={{ marginLeft: 3 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      {arrowPosition === 'bottom' && <View style={[styles.arrow, styles.arrowBottom]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1002,
  },
  containerTop: {
    marginTop: 6,
  },
  containerBottom: {
    marginBottom: 6,
    marginTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24, // Bong bóng tròn trịa hơn
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E0FF', // Viền tím nhạt thanh lịch
    ...SHADOW.md,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECE9FF', // Nền tím siêu nhạt làm nổi bật emoji
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4CFFF',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    flex: 1,
    paddingRight: 6,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full, // Nút tròn (pill shape)
    backgroundColor: COLORS.borderLight,
  },
  skipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  description: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 2,
  },
  stepNum: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 5,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full, // Nút tròn (pill shape)
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    gap: 2,
  },
  btnBackText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.bold,
  },
  btnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full, // Nút tròn (pill shape)
    backgroundColor: COLORS.primary,
    ...SHADOW.sm,
  },
  btnNextText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: FONT_WEIGHT.bold,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    alignSelf: 'center',
  },
  arrowTop: {
    marginBottom: -1.5,
  },
  arrowBottom: {
    marginTop: -1.5,
    transform: [{ rotate: '180deg' }],
  },
});
