// SetFit Color Palette - Based on branding guide
export const colors = {
  // Core Colors
  setFlowGreen: '#10B981',
  restTeal: '#14B8A6',
  focusIndigo: '#6366F1',
  warningAmber: '#F59E0B',
  alertRed: '#EF4444',

  // Neutrals
  ink: '#111827',
  slate: '#6B7280',
  cloud: '#E5E7EB',
  paper: '#FFFFFF',
  charcoal: '#0B1220', // Dark mode background

  // Color variants for accessibility
  setFlowGreen700: '#059669', // Text on light backgrounds
  focusIndigo700: '#4F46E5', // Text on light backgrounds
};

// Color usage by state
export const stateColors = {
  exerciseActive: colors.setFlowGreen,
  restActive: colors.restTeal,
  lastSeconds: colors.warningAmber,
  stopped: colors.alertRed,
  paused: colors.slate,
};

// Button states
export const buttonStates = {
  default: colors.setFlowGreen,
  hover: '#0FB37A',
  active: '#0A8F64',
  disabled: '#86E7C6',
};