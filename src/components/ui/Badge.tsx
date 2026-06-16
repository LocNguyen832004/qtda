import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../utils/theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.primary,
  textColor = '#fff',
  style,
  size = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: color + '22' }, size === 'sm' && styles.sm, style]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.smText]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  smText: {
    fontSize: FONT_SIZE.xs,
  },
});
