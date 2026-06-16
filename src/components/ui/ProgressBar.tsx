import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { COLORS, RADIUS } from '../../utils/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.primary,
  height = 6,
  style,
}) => {
  const clamp = Math.min(1, Math.max(0, progress));
  const progressAnim = useRef(new Animated.Value(clamp)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clamp,
      duration: 350,
      useNativeDriver: false, // width interpolation doesn't support native driver but is very lightweight here
    }).start();
  }, [clamp, progressAnim]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolate,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
