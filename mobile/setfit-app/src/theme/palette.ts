export const palette = {
  core: {
    active: '#10B981',
    rest: '#14B8A6',
    focus: '#6366F1',
    warning: '#F59E0B',
    alert: '#EF4444',
  },
  neutral: {
    ink: '#111827',
    slate: '#6B7280',
    cloud: '#E5E7EB',
    paper: '#FFFFFF',
    charcoal: '#0B1220',
  },
} as const;

export type Palette = typeof palette;
