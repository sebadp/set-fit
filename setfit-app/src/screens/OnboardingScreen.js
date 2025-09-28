import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';

// Import onboarding slides
import { SplashSlide } from '../components/onboarding/SplashSlide';
import { WelcomeSlide } from '../components/onboarding/WelcomeSlide';
import { TimerFeatureSlide } from '../components/onboarding/TimerFeatureSlide';
import { CreateRoutineSlide } from '../components/onboarding/CreateRoutineSlide';
import { SeriesSlide } from '../components/onboarding/SeriesSlide';
import { ExerciseLibrarySlide } from '../components/onboarding/ExerciseLibrarySlide';
import { ProgressSlide } from '../components/onboarding/ProgressSlide';
import { SetupSlide } from '../components/onboarding/SetupSlide';
import { ReadySlide } from '../components/onboarding/ReadySlide';

// Import reusable components
import { NavigationDots } from '../components/onboarding/NavigationDots';
import { OnboardingContext } from '../contexts/OnboardingContext';

const { width: screenWidth } = Dimensions.get('window');

const SLIDES = [
  { Component: SplashSlide, autoAdvance: true, duration: 2000 },
  { Component: WelcomeSlide, autoAdvance: false },
  { Component: TimerFeatureSlide, autoAdvance: false },
  { Component: CreateRoutineSlide, autoAdvance: false },
  { Component: SeriesSlide, autoAdvance: false },
  { Component: ExerciseLibrarySlide, autoAdvance: false },
  { Component: ProgressSlide, autoAdvance: false },
  { Component: SetupSlide, autoAdvance: false },
  { Component: ReadySlide, autoAdvance: false },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    userName: '',
    createdExercises: [],
    createdRoutines: [],
    preferences: {
      sound: true,
      vibration: true,
      countdown: true,
      darkMode: false,
    },
    progress: {
      timerTried: false,
      blockAdded: false,
      exerciseCreated: false,
      preferencesSet: false,
    },
  });

  useEffect(() => {
    console.log('[Onboarding] mounted');
    return () => console.log('[Onboarding] unmounted');
  }, []);

  useEffect(() => {
    console.log('[Onboarding] currentSlide', currentSlide, 'component', SLIDES[currentSlide]?.Component?.name);
  }, [currentSlide]);

  const translateX = useSharedValue(0);
  const currentSlideValue = useSharedValue(0);

  // Auto-advance for splash screen
  useEffect(() => {
    const slide = SLIDES[currentSlide];
    if (slide.autoAdvance) {
      const timer = setTimeout(() => {
        nextSlide();
      }, slide.duration);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  // Save progress to AsyncStorage
  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('onboarding_progress', JSON.stringify({
        currentSlide,
        onboardingData,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error);
    }
  };

  // Update onboarding data
  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Navigation functions
  const nextSlide = () => {
    console.log('[Onboarding] nextSlide from', currentSlide);
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
      currentSlideValue.value = withSpring(currentSlide + 1);
      saveProgress();
    }
  };

  const prevSlide = () => {
    console.log('[Onboarding] prevSlide from', currentSlide);
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      currentSlideValue.value = withSpring(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < SLIDES.length) {
      setCurrentSlide(index);
      currentSlideValue.value = withSpring(index);
    }
  };

  const skipOnboarding = async () => {
    console.log('[Onboarding] skip requested');
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('onboarding_skipped', 'true');
      navigation.replace('Main');
    } catch (error) {
      console.warn('Failed to save onboarding skip:', error);
      navigation.replace('Main');
    }
  };

  const completeOnboarding = async () => {
    console.log('[Onboarding] complete requested');
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('user_data', JSON.stringify(onboardingData));

      // Track completion metrics
      const completionData = {
        completedAt: Date.now(),
        totalSlides: SLIDES.length,
        userData: onboardingData,
        progress: onboardingData.progress,
      };
      await AsyncStorage.setItem('onboarding_metrics', JSON.stringify(completionData));

      navigation.replace('Main');
    } catch (error) {
      console.warn('Failed to save onboarding completion:', error);
      navigation.replace('Main');
    }
  };

  // Gesture handler for swipe navigation
  const gestureHandler = useMemo(() =>
    Gesture.Pan()
      .onBegin(() => {
        console.log('[Onboarding] gesture begin');
        translateX.value = 0;
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        const threshold = screenWidth * 0.25;

        if (event.translationX < -threshold && currentSlide < SLIDES.length - 1) {
          // Swipe left - next slide
          runOnJS(nextSlide)();
        } else if (event.translationX > threshold && currentSlide > 1) {
          // Swipe right - previous slide (not on splash/welcome)
          runOnJS(prevSlide)();
        }
      })
      .onFinalize(() => {
        translateX.value = withSpring(0);
      }),
  [currentSlide, nextSlide, prevSlide, translateX]
  );

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value - (currentSlideValue.value * screenWidth),
        },
      ],
    };
  });

  const renderSlides = () =>
    SLIDES.map(({ Component }, index) => (
      <View key={Component.name || index} style={styles.slideWrapper}>
        <Component
          onNext={nextSlide}
          onPrev={prevSlide}
          onSkip={skipOnboarding}
          onComplete={completeOnboarding}
          onDataUpdate={updateOnboardingData}
          data={onboardingData}
          isActive={currentSlide === index}
        />
      </View>
    ));

  const contextValue = {
    currentSlide,
    totalSlides: SLIDES.length,
    onboardingData,
    updateOnboardingData,
    nextSlide,
    prevSlide,
    goToSlide,
    skipOnboarding,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Skip button - hidden on splash and final slide */}
        {currentSlide > 0 && currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}

        {/* Main slide container */}
        <GestureDetector gesture={gestureHandler}>
          <Animated.View style={[styles.slideContainer, containerStyle]}>
            {renderSlides()}
          </Animated.View>
        </GestureDetector>

        {/* Navigation dots - hidden on splash and final slide */}
        {currentSlide > 0 && currentSlide < SLIDES.length - 1 && (
          <View style={styles.navigationContainer}>
            <NavigationDots
              current={currentSlide - 1} // Adjust for splash screen
              total={SLIDES.length - 2} // Exclude splash and final
              onDotPress={(index) => goToSlide(index + 1)}
            />
          </View>
        )}

        {/* Background gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)']}
          style={styles.gradientOverlay}
        />
      </View>
    </OnboardingContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slideContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * SLIDES.length,
  },
  slideWrapper: {
    width: screenWidth,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
    pointerEvents: 'none',
  },
});
