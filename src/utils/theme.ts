export const COLORS = {
  // Primary palette
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42D6',
  secondary: '#43BCCD',
  accent: '#FF6584',

  // Neutrals
  background: '#F8F9FE',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E8EAF6',
  borderLight: '#F0F2FF',

  // Text
  textPrimary: '#1A1B2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#56C271',
  warning: '#F9A826',
  danger: '#FF6584',
  info: '#43BCCD',

  // Priority
  priorityHigh: '#FF6584',
  priorityMedium: '#F9A826',
  priorityLow: '#56C271',

  // Tab bar
  tabActive: '#6C63FF',
  tabInactive: '#9CA3AF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOW = {
  xs: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
