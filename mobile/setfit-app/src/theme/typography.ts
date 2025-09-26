import type { TextStyle } from 'react-native';

export const fontFamilies = {
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: 'RedHatMono_500Medium',
} as const;

export const textVariants = {
  title: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 32,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  body: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  cardTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 20,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  timer: {
    fontFamily: fontFamilies.mono,
    fontSize: 72,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
}

export type FontFamilies = typeof fontFamilies;
export type TextVariants = typeof textVariants;
