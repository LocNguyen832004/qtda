import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW } from '../../utils/theme';

interface TutorialTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  arrowPosition?: 'top' | 'bottom';
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
}) => {
  return (
    <View style={[styles.container, arrowPosition === 'bottom' ? styles.containerBottom : styles.containerTop]}>
      {arrowPosition === 'top' && <View style={[styles.arrow, styles.arrowTop]} />}
      
      <View style={styles.card}>
        {/* Title & Skip */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>

        {/* Text */}
        <Text style={styles.description}>{description}</Text>

        {/* Controls */}
        <View style={styles.footer}>
          <Text style={styles.stepNum}>Bước {step}/{totalSteps}</Text>
          
          <View style={styles.btnRow}>
            {step > 1 && onPrev && (
              <TouchableOpacity onPress={onPrev} style={styles.btnBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={12} color={COLORS.textSecondary} />
                <Text style={styles.btnBackText}>Quay lại</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={onNext} style={styles.btnNext} activeOpacity={0.8}>
              <Text style={styles.btnNextText}>
                {step === totalSteps ? 'Xong' : 'Tiếp tục'}
              </Text>
              <Ionicons
                name={step === totalSteps ? 'checkmark' : 'arrow-forward'}
                size={12}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
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
    marginTop: 8,
  },
  containerBottom: {
    marginBottom: 8,
    marginTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(108, 99, 255, 0.15)',
    ...SHADOW.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    flex: 1,
    paddingRight: 6,
  },
  skipBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.borderLight,
  },
  skipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  stepNum: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    gap: 3,
  },
  btnBackText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.bold,
  },
  btnNext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    ...SHADOW.sm,
  },
  btnNextText: {
    fontSize: FONT_SIZE.xs,
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
    marginBottom: -1,
  },
  arrowBottom: {
    marginTop: -1,
    transform: [{ rotate: '180deg' }],
  },
});
