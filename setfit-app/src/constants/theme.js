import { colors } from './colors';

// Typography system based on branding guide
export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700', // Inter Bold
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600', // Inter Semibold
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400', // Inter Regular
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  timer: {
    fontSize: 72,
    lineHeight: 72,
    fontWeight: '500', // Red Hat Mono (implement later)
    fontVariant: ['tabular-nums'],
  },
};

// Spacing system (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border radius
export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
};

// Shadows/Elevation
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4, // Android
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8, // Android
  },
};

// Default theme (dark mode first)
export const theme = {
  colors: {
    primary: colors.setFlowGreen,
    secondary: colors.restTeal,
    accent: colors.focusIndigo,
    warning: colors.warningAmber,
    error: colors.alertRed,

    background: colors.charcoal,
    surface: colors.ink,
    text: colors.paper,
    textSecondary: colors.cloud,
    textMuted: colors.slate,

    border: colors.slate,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};