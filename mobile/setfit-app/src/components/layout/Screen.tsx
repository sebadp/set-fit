import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';

export type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
};

export const Screen = ({ children, padded = true }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: padded ? theme.spacing.lg : 0,
          paddingTop: insets.top + (padded ? theme.spacing.lg : 0),
          paddingBottom: insets.bottom + (padded ? theme.spacing.lg : 0),
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
