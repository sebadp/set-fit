import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Button } from '../common/Button';

export const TimeInput = ({ onTimeSet, initialMinutes = 5, initialSeconds = 0 }) => {
  const [minutes, setMinutes] = useState(initialMinutes.toString());
  const [seconds, setSeconds] = useState(initialSeconds.toString());

  const handleSetTime = () => {
    const mins = Math.max(0, Math.min(99, parseInt(minutes) || 0));
    const secs = Math.max(0, Math.min(59, parseInt(seconds) || 0));

    if (mins === 0 && secs === 0) return; // No permitir tiempo 0

    const totalSeconds = mins * 60 + secs;
    onTimeSet(totalSeconds);
  };

  const handleMinutesChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 2) {
      setMinutes(numericValue);
    }
  };

  const handleSecondsChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 2) {
      setSeconds(numericValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Configurar tiempo</Text>

      <View style={styles.inputContainer}>
        <View style={styles.timeInputGroup}>
          <TextInput
            style={styles.timeInput}
            value={minutes}
            onChangeText={handleMinutesChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder="05"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.unitLabel}>min</Text>
        </View>

        <Text style={styles.separator}>:</Text>

        <View style={styles.timeInputGroup}>
          <TextInput
            style={styles.timeInput}
            value={seconds}
            onChangeText={handleSecondsChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder="00"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.unitLabel}>seg</Text>
        </View>
      </View>

      <Button
        title="Configurar"
        onPress={handleSetTime}
        style={styles.setButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  label: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 60,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  unitLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  separator: {
    ...theme.typography.timer,
    fontSize: 32,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  setButton: {
    width: '60%',
  },
});