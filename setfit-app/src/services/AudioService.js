import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

let createAudioPlayer = null;
let setAudioModeAsync = null;

if (!isWeb) {
  try {
    const ExpoAudio = require('expo-audio');
    createAudioPlayer = ExpoAudio?.createAudioPlayer ?? null;
    setAudioModeAsync = ExpoAudio?.setAudioModeAsync ?? null;
  } catch (error) {
    console.warn('expo-audio not available, falling back to haptics only:', error);
  }
}

class AudioService {
  constructor() {
    this.sounds = new Map();
    this.isInitialized = false;
    this.volumeLevel = 1.0;
    this.soundsEnabled = true;
    this.vibrationsEnabled = true;
    this.init();
  }

  async init() {
    try {
      // Configure audio mode for app
      if (setAudioModeAsync) {
        await setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }

      // Load all workout sounds
      await this.loadSounds();
      this.isInitialized = true;
      console.log('✅ AudioService initialized successfully');
    } catch (error) {
      console.error('❌ AudioService initialization failed:', error);
    }
  }

  async loadSounds() {
    const soundAssets = {
      countdown3: require('../../assets/sounds/countdown3.wav'),
      countdown2: require('../../assets/sounds/countdown2.wav'),
      countdown1: require('../../assets/sounds/countdown1.wav'),
      exerciseStart: require('../../assets/sounds/exercise-start.wav'),
      restStart: require('../../assets/sounds/rest-start.wav'),
      setComplete: require('../../assets/sounds/set-complete.wav'),
      workoutComplete: require('../../assets/sounds/workout-complete.wav'),
      workoutPaused: require('../../assets/sounds/workout-paused.wav'),
      workoutResumed: require('../../assets/sounds/workout-resumed.wav'),
      buttonPress: require('../../assets/sounds/button-press.wav'),
      success: require('../../assets/sounds/success.wav'),
      error: require('../../assets/sounds/error.wav'),
    };

    let loadedCount = 0;

    Object.entries(soundAssets).forEach(([key, asset]) => {
      if (!createAudioPlayer) {
        this.sounds.set(key, null);
        return;
      }

      try {
        const player = createAudioPlayer(asset, {
          keepAudioSessionActive: false,
        });
        player.volume = this.volumeLevel;
        this.sounds.set(key, player);
        loadedCount += 1;
      } catch (error) {
        console.warn(`Failed to create audio player for ${key}:`, error);
        this.sounds.set(key, null);
      }
    });

    if (loadedCount > 0) {
      console.log('✅ Audio players ready (expo-audio)', loadedCount);
    } else {
      console.log('⚠️ expo-audio unavailable, falling back to haptics');
    }
  }

  // Create programmatic beep sounds if files are not available
  async createBeepSound(frequency = 800, duration = 200) {
    try {
      // For now, we'll use haptic feedback as fallback
      if (this.vibrationsEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.warn('Failed to create beep sound:', error);
    }
  }

  async playSound(soundName, options = {}) {
    if (!this.soundsEnabled || !this.isInitialized) {
      return;
    }

    try {
      const sound = this.sounds.get(soundName);

      if (sound && typeof sound.play === 'function') {
        try {
          if (sound.playing) {
            sound.pause();
          }
          await sound.seekTo(0).catch(() => {});
        } catch (seekError) {
          console.warn(`Failed to reset sound ${soundName}:`, seekError);
        }

        const volume = options.volume !== undefined
          ? options.volume * this.volumeLevel
          : this.volumeLevel;

        sound.volume = Math.max(0, Math.min(1, volume));
        sound.play();
      } else {
        // Fallback to programmatic sound
        await this.createBeepSound(options.frequency, options.duration);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  async playCountdown(count) {
    const soundMap = {
      3: 'countdown3',
      2: 'countdown2',
      1: 'countdown1'
    };

    const soundName = soundMap[count];
    if (soundName) {
      await this.playSound(soundName);
      await this.vibrate('countdown');
    }
  }

  async playExerciseStart() {
    await this.playSound('exerciseStart');
    await this.vibrate('exerciseStart');
  }

  async playRestStart() {
    await this.playSound('restStart');
    await this.vibrate('restStart');
  }

  async playSetComplete() {
    await this.playSound('setComplete');
    await this.vibrate('setComplete');
  }

  async playWorkoutComplete() {
    await this.playSound('workoutComplete');
    await this.vibrate('workoutComplete');
  }

  async playWorkoutPaused() {
    await this.playSound('workoutPaused');
    await this.vibrate('pause');
  }

  async playWorkoutResumed() {
    await this.playSound('workoutResumed');
    await this.vibrate('resume');
  }

  async playButtonPress() {
    await this.playSound('buttonPress', { volume: 0.5 });
  }

  async playSuccess() {
    await this.playSound('success');
    await this.vibrate('success');
  }

  async playError() {
    await this.playSound('error');
    await this.vibrate('error');
  }

  // Vibration patterns
  async vibrate(pattern) {
    if (!this.vibrationsEnabled) {
      return;
    }

    try {
      const patterns = {
        countdown: [100],
        exerciseStart: [200],
        restStart: [100, 50, 100],
        setComplete: [150, 50, 150],
        workoutComplete: [200, 100, 200, 100, 200],
        pause: [100, 100, 100],
        resume: [200],
        success: [100, 50, 100, 50, 100],
        error: [300],
        button: [50],
      };

      const vibrationPattern = patterns[pattern] || [100];

      // Use Haptics for more refined feedback on iOS
      if (pattern === 'countdown' || pattern === 'button') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (pattern === 'exerciseStart' || pattern === 'resume') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (pattern === 'setComplete' || pattern === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (pattern === 'workoutComplete') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Additional celebration vibration
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      } else if (pattern === 'error') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        // Fallback to basic vibration
        Vibration.vibrate(vibrationPattern);
      }
    } catch (error) {
      console.warn(`Failed to vibrate with pattern ${pattern}:`, error);
    }
  }

  // Settings
  setVolume(volume) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    this.sounds.forEach((sound) => {
      if (sound) {
        try {
          sound.volume = this.volumeLevel;
        } catch (error) {
          console.warn('Failed to update sound volume:', error);
        }
      }
    });
  }

  setSoundsEnabled(enabled) {
    this.soundsEnabled = enabled;
    if (!enabled) {
      this.sounds.forEach((sound) => {
        if (sound && sound.playing) {
          sound.pause();
          sound.seekTo(0).catch(() => {});
        }
      });
    }
  }

  setVibrationsEnabled(enabled) {
    this.vibrationsEnabled = enabled;
  }

  // Workout-specific sequences
  async playPreparationSequence() {
    // 3-2-1 countdown for workout preparation
    await this.playCountdown(3);
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.playCountdown(2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.playCountdown(1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.playExerciseStart();
  }

  async playTransitionSequence(fromType, toType) {
    if (toType === 'exercise') {
      await this.playExerciseStart();
    } else if (toType === 'rest') {
      await this.playRestStart();
    } else if (toType === 'complete') {
      await this.playWorkoutComplete();
    }
  }

  // Cleanup
  async cleanup() {
    try {
      for (const [key, sound] of this.sounds) {
        if (sound && typeof sound.remove === 'function') {
          try {
            sound.remove();
          } catch (error) {
            console.warn(`Failed to remove player ${key}:`, error);
          }
        }
      }
      this.sounds.clear();
      this.isInitialized = false;
      console.log('✅ AudioService cleaned up');
    } catch (error) {
      console.error('❌ AudioService cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
