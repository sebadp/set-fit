import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width } = Dimensions.get('window');

export const ExerciseLibrarySlide = ({ onNext, onDataUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [createdExercise, setCreatedExercise] = useState(null);
  const { onboardingData } = useOnboarding();

  const titleOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const createExercise = () => {
    if (newExerciseName.trim()) {
      const exercise = {
        id: Date.now(),
        name: newExerciseName.trim(),
        category: 'personalizado',
        duration: 30,
        createdAt: Date.now(),
      };

      setCreatedExercise(exercise.name);
      setNewExerciseName('');
      successScale.value = withSpring(1);

      onDataUpdate({
        createdExercises: [...(onboardingData.createdExercises || []), exercise],
        progress: {
          ...onboardingData.progress,
          exerciseCreated: true,
        },
      });

      setTimeout(() => {
        setCreatedExercise(null);
        successScale.value = withTiming(0);
      }, 3000);
    }
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const exercises = [
    { icon: '🔥', name: 'Burpees', time: '30s' },
    { icon: '💪', name: 'Flexiones', time: '45s' },
    { icon: '🦵', name: 'Sentadillas', time: '30s' },
    { icon: '🏃', name: 'Mountain Climbers', time: '30s' },
  ];

  const categories = ['Todos', 'Fuerza', 'Cardio', 'Flexibilidad'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.header, titleAnimatedStyle]}>
            <Text style={styles.title}>Tu biblioteca personal 📚</Text>
            <Text style={styles.subtitle}>Explora y crea ejercicios únicos</Text>
          </Animated.View>

          <ScrollView horizontal style={styles.categories} showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.toLowerCase() && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(cat.toLowerCase())}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.toLowerCase() && styles.selectedCategoryText
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.exerciseGrid}>
            {exercises.map((exercise, index) => (
              <ExerciseCard key={index} {...exercise} />
            ))}
          </View>

          <View style={styles.quickCreate}>
            <Text style={styles.createTitle}>¡Crea el tuyo!</Text>
            <View style={styles.createForm}>
              <TextInput
                style={styles.input}
                placeholder="Nombre del ejercicio"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                onSubmitEditing={createExercise}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={createExercise}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {createdExercise && (
            <Animated.View style={[styles.successToast, successAnimatedStyle]}>
              <Text style={styles.successText}>
                "{createdExercise}" agregado a tu biblioteca ✅
              </Text>
            </Animated.View>
          )}

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

const ExerciseCard = ({ icon, name, time }) => (
  <View style={styles.exerciseCard}>
    <Text style={styles.exerciseIcon}>{icon}</Text>
    <Text style={styles.exerciseName}>{name}</Text>
    <Text style={styles.exerciseTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, width },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xxl, minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  categories: { marginBottom: theme.spacing.lg },
  categoryChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  selectedCategory: { backgroundColor: 'rgba(255,255,255,0.3)' },
  categoryText: { color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  selectedCategoryText: { color: 'white', fontWeight: '600' },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  exerciseCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  exerciseIcon: { fontSize: 32, marginBottom: 8 },
  exerciseName: { color: 'white', fontWeight: '600', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  exerciseTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  quickCreate: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  createTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 12, textAlign: 'center' },
  createForm: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: 'white', marginRight: 8 },
  addButton: { backgroundColor: theme.colors.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: '600' },
  successToast: { backgroundColor: theme.colors.success, padding: 12, borderRadius: 8, marginBottom: theme.spacing.lg },
  successText: { color: 'white', textAlign: 'center', fontWeight: '500' },
  continueButton: { borderRadius: 25, overflow: 'hidden', marginTop: theme.spacing.lg },
  continueGradient: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  continueText: { color: 'white', fontSize: 16, fontWeight: '600' },
});