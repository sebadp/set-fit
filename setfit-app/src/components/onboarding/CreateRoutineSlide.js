import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { createShadow, createTextShadow } from '../../utils/platformStyles';

const { width } = Dimensions.get('window');

export const CreateRoutineSlide = ({ onNext, onDataUpdate }) => {
  const [blocks, setBlocks] = useState([]);
  const [hasCreatedRoutine, setHasCreatedRoutine] = useState(false);
  const { onboardingData } = useOnboarding();

  const titleOpacity = useSharedValue(0);
  const achievementScale = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    if (blocks.length >= 3 && !hasCreatedRoutine) {
      setHasCreatedRoutine(true);
      achievementScale.value = withSpring(1);

      // Update progress
      onDataUpdate({
        createdRoutines: [{ blocks, createdAt: Date.now() }],
        progress: {
          ...onboardingData.progress,
          blockAdded: true,
        },
      });
    }
  }, [blocks]);

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      duration: type === 'exercise' ? 30 : 10,
      name: type === 'exercise' ? 'Ejercicio' : 'Descanso',
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const calculateTotalTime = () => {
    return blocks.reduce((total, block) => total + block.duration, 0);
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const achievementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievementScale.value }],
    opacity: achievementScale.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ff9a9e', '#fecfef', '#fecfef']}
        style={styles.gradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={[styles.header, titleAnimatedStyle]}>
            <Text style={styles.title}>Crea rutinas en segundos 🏃‍♂️</Text>
            <Text style={styles.subtitle}>
              Toca para agregar bloques a tu rutina
            </Text>
          </Animated.View>

          <View style={styles.builderSection}>
            <View style={styles.blockOptions}>
              <TouchableOpacity
                style={[styles.addButton, styles.exerciseButton]}
                onPress={() => addBlock('exercise')}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonEmoji}>💪</Text>
                <Text style={styles.addButtonText}>Ejercicio (30s)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, styles.restButton]}
                onPress={() => addBlock('rest')}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonEmoji}>😴</Text>
                <Text style={styles.addButtonText}>Descanso (10s)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routinePreview}>
              <Text style={styles.previewTitle}>Tu rutina:</Text>

              {blocks.length === 0 ? (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    Tu rutina aparecerá aquí...
                  </Text>
                </View>
              ) : (
                <View style={styles.blocksList}>
                  {blocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))}
                </View>
              )}

              {blocks.length > 0 && (
                <View style={styles.totalTime}>
                  <Text style={styles.totalTimeText}>
                    ⏱️ Total: {calculateTotalTime()} segundos
                  </Text>
                </View>
              )}
            </View>
          </View>

          {hasCreatedRoutine && (
            <Animated.View style={[styles.achievementContainer, achievementAnimatedStyle]}>
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🎉</Text>
                <Text style={styles.achievementTitle}>¡Primera rutina creada!</Text>
                <Text style={styles.achievementPoints}>+10 XP</Text>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={onNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.success, '#20BF6B']}
                  style={styles.continueGradient}
                >
                  <Text style={styles.continueText}>¡Continuar! ✨</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const DraggableBlock = ({ block, index, onRemove }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { delay: index * 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isExercise = block.type === 'exercise';

  return (
    <Animated.View style={[styles.blockItem, animatedStyle]}>
      <View style={[
        styles.blockContent,
        isExercise ? styles.exerciseBlock : styles.restBlock
      ]}>
        <Text style={styles.blockEmoji}>
          {isExercise ? '💪' : '😴'}
        </Text>
        <View style={styles.blockInfo}>
          <Text style={styles.blockName}>{block.name}</Text>
          <Text style={styles.blockDuration}>{block.duration}s</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.8}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    ...createTextShadow({ offsetY: 2, blurRadius: 4 }),
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  builderSection: {
    marginBottom: theme.spacing.xl,
  },
  blockOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  addButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...createShadow({ offsetY: 2, blurRadius: 12, opacity: 0.2, elevation: 4 }),
  },
  exerciseButton: {
    backgroundColor: 'rgba(255,107,107,0.8)',
  },
  restButton: {
    backgroundColor: 'rgba(116,185,255,0.8)',
  },
  addButtonEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  routinePreview: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholder: {
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontStyle: 'italic',
  },
  blocksList: {
    gap: 8,
  },
  blockItem: {
    marginBottom: 8,
  },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exerciseBlock: {
    backgroundColor: 'rgba(255,107,107,0.6)',
  },
  restBlock: {
    backgroundColor: 'rgba(116,185,255,0.6)',
  },
  blockEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  blockInfo: {
    flex: 1,
  },
  blockName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  blockDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalTime: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalTimeText: {
    color: 'white',
    fontWeight: '600',
  },
  achievementContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  achievement: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...createShadow({ offsetY: 4, blurRadius: 16, opacity: 0.3, elevation: 4 }),
  },
  continueGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
