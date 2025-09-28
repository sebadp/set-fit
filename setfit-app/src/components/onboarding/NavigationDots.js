import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const NavigationDots = ({ current, total, onDotPress }) => {
  return (
    <View style={styles.container}>
      {[...Array(total)].map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onDotPress && onDotPress(index)}
          style={styles.dotContainer}
        >
          <Dot
            index={index}
            current={current}
            total={total}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Dot = ({ index, current }) => {
  const isActive = index === current;
  const isCompleted = index < current;

  const width = isActive ? 24 : 8;
  const backgroundColor = isCompleted
    ? theme.colors.success
    : isActive
      ? theme.colors.primary
      : 'rgba(255,255,255,0.3)';

  return (
    <View
      style={[
        styles.dot,
        {
          width,
          backgroundColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dotContainer: {
    padding: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
