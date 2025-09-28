import React, { createContext, useContext } from 'react';

const OnboardingContext = createContext({
  currentSlide: 0,
  totalSlides: 0,
  onboardingData: {
    userName: '',
    createdExercises: [],
    createdRoutines: [],
    preferences: {},
    progress: {},
  },
  updateOnboardingData: () => {},
  nextSlide: () => {},
  prevSlide: () => {},
  goToSlide: () => {},
  skipOnboarding: () => {},
  completeOnboarding: () => {},
});

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingContext.Provider');
  }
  return context;
};

export { OnboardingContext };