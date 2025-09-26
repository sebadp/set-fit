export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
} as const;

export const typography = {
  heading: 32,
  subheading: 24,
  body: 16,
  caption: 12,
  timer: 72,
} as const;

export type SpacingTokens = typeof spacing;
export type RadiiTokens = typeof radii;
