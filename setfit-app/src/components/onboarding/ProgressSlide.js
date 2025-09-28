import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const ProgressSlide = ({ onNext }) => {
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.gradient} />
      <View style={styles.content}>
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.title}>Seguí tu progreso 📈</Text>
          <Text style={styles.subtitle}>Cada entrenamiento cuenta</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <AnimatedStat icon="🔥" value="7" label="Racha máxima" suffix=" días" delay={200} />
          <AnimatedStat icon="💪" value="23" label="Entrenamientos" suffix="" delay={400} />
          <AnimatedStat icon="⏱️" value="485" label="Minutos totales" suffix=" min" delay={600} />
          <AnimatedStat icon="🏆" value="100" label="Tu nivel" suffix=" XP" delay={800} />
        </View>

        <View style={styles.calendar}>
          <Text style={styles.calendarTitle}>Tu semana ideal:</Text>
          <View style={styles.weekDays}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <View key={day} style={[
                styles.dayCircle,
                [true, false, true, true, false, false, false][index] && styles.completedDay
              ]}>
                <Text style={[
                  styles.dayText,
                  [true, false, true, true, false, false, false][index] && styles.completedDayText
                ]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.motivation}>
          <Text style={styles.motivationText}>
            "Cada entrenamiento cuenta.{"\n"}Nosotros llevamos la cuenta por vos."
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.continueGradient}>
            <Text style={styles.continueText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AnimatedStat = ({ icon, value, label, suffix, delay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const numberValue = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    numberValue.value = withDelay(delay + 200, withTiming(parseInt(value), { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedNumberStyle = useAnimatedStyle(() => {
    const displayValue = Math.floor(numberValue.value);
    return {}; // React Native doesn't support animated text interpolation easily
  });

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}{suffix}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl },
  header: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  statCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  calendar: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  calendarTitle: { fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 12, textAlign: 'center' },
  weekDays: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  completedDay: { backgroundColor: theme.colors.success },
  dayText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  completedDayText: { color: 'white' },
  motivation: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  motivationText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  continueButton: { borderRadius: 25, overflow: 'hidden' },
  continueGradient: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  continueText: { color: 'white', fontSize: 16, fontWeight: '600' },
});