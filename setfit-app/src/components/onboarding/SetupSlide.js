import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Switch, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width } = Dimensions.get('window');

export const SetupSlide = ({ onNext, onDataUpdate }) => {
  const { onboardingData } = useOnboarding();
  const [preferences, setPreferences] = useState({
    sound: true,
    vibration: true,
    countdown: true,
    darkMode: false,
    ...onboardingData.preferences,
  });
  const [selectedGoal, setSelectedGoal] = useState(null);

  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    onDataUpdate({
      preferences,
      progress: {
        ...onboardingData.progress,
        preferencesSet: Object.keys(preferences).some(key => preferences[key] !== onboardingData.preferences[key]),
      },
    });
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const goals = [
    { emoji: '💪', text: 'Fuerza' },
    { emoji: '🏃', text: 'Cardio' },
    { emoji: '🧘', text: 'Flexibilidad' },
    { emoji: '⚖️', text: 'Balance' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.header, titleAnimatedStyle]}>
            <Text style={styles.title}>Personalizá tu experiencia ⚙️</Text>
            <Text style={styles.subtitle}>Configura SetFit a tu gusto</Text>
          </Animated.View>

          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Configuraciones</Text>
            
            <PreferenceRow
              icon="🔔"
              title="Alertas sonoras"
              subtitle="Beeps antes de cambiar"
              value={preferences.sound}
              onToggle={(val) => updatePreference('sound', val)}
            />
            
            <PreferenceRow
              icon="📳"
              title="Vibración"
              subtitle="Feedback táctil"
              value={preferences.vibration}
              onToggle={(val) => updatePreference('vibration', val)}
            />
            
            <PreferenceRow
              icon="⏰"
              title="Cuenta regresiva"
              subtitle="3, 2, 1..."
              value={preferences.countdown}
              onToggle={(val) => updatePreference('countdown', val)}
            />
            
            <PreferenceRow
              icon="🌙"
              title="Modo oscuro"
              subtitle="Protege tus ojos"
              value={preferences.darkMode}
              onToggle={(val) => updatePreference('darkMode', val)}
            />
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.sectionTitle}>¿Cuál es tu objetivo?</Text>
            <View style={styles.goalOptions}>
              {goals.map((goal, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.goalChip,
                    selectedGoal === goal.text && styles.selectedGoal
                  ]}
                  onPress={() => setSelectedGoal(goal.text)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={[
                    styles.goalText,
                    selectedGoal === goal.text && styles.selectedGoalText
                  ]}>{goal.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onNext}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.continueGradient}>
              <Text style={styles.continueText}>Continuar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const PreferenceRow = ({ icon, title, subtitle, value, onToggle }) => (
  <View style={styles.preferenceRow}>
    <View style={styles.preferenceInfo}>
      <Text style={styles.preferenceIcon}>{icon}</Text>
      <View style={styles.preferenceTexts}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: 'rgba(255,255,255,0.2)', true: theme.colors.primary }}
      thumbColor={value ? 'white' : 'rgba(255,255,255,0.8)'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, width },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xxl, minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  preferencesSection: { marginBottom: theme.spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: 'white', marginBottom: theme.spacing.lg },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  preferenceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  preferenceIcon: { fontSize: 24, marginRight: 12 },
  preferenceTexts: { flex: 1 },
  preferenceTitle: { fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 2 },
  preferenceSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  goalSection: { marginBottom: theme.spacing.xl },
  goalOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  goalChip: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  selectedGoal: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' },
  goalEmoji: { fontSize: 32, marginBottom: 8 },
  goalText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  selectedGoalText: { color: 'white', fontWeight: '600' },
  continueButton: { borderRadius: 25, overflow: 'hidden', marginTop: theme.spacing.lg },
  continueGradient: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  continueText: { color: 'white', fontSize: 16, fontWeight: '600' },
});