import { colors } from './colors';
import { createShadow } from '../utils/platformStyles';

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
  card: createShadow({ offsetY: 4, blurRadius: 12, opacity: 0.08, elevation: 4 }),
  modal: createShadow({ offsetY: 8, blurRadius: 24, opacity: 0.16, elevation: 8 }),
};

const buildTheme = (palette) => ({
  colors: palette,
  typography,
  spacing,
  borderRadius,
  shadows,
});

const darkPalette = {
  primary: colors.setFlowGreen,
  primaryDark: colors.setFlowGreen700,
  secondary: colors.restTeal,
  secondaryDark: '#0D9488',
  accent: colors.focusIndigo,
  accentDark: colors.focusIndigo700,
  warning: colors.warningAmber,
  error: colors.alertRed,
  success: colors.setFlowGreen,

  background: colors.charcoal,
  surface: colors.ink,
  text: colors.paper,
  textSecondary: colors.cloud,
  textMuted: colors.slate,
  border: colors.slate,
  overlay: 'rgba(11,18,32,0.75)',
};

const lightPalette = {
  primary: colors.setFlowGreen,
  primaryDark: colors.setFlowGreen700,
  secondary: colors.restTeal,
  secondaryDark: '#0D9488',
  accent: colors.focusIndigo,
  accentDark: colors.focusIndigo700,
  warning: '#D97706',
  error: colors.alertRed,
  success: colors.setFlowGreen,

  background: '#F7F8FA',
  surface: colors.paper,
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  border: '#D1D5DB',
  overlay: 'rgba(255,255,255,0.85)',
};

export const darkTheme = buildTheme(darkPalette);
export const lightTheme = buildTheme(lightPalette);

export const themes = {
  dark: darkTheme,
  light: lightTheme,
};

// Legacy default export to keep backward compatibility during migration
export const theme = darkTheme;
