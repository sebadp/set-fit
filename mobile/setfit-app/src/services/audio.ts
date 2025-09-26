import { Audio, AVPlaybackStatusSuccess } from 'expo-av';

const assetMap = {
  countdownShort: require('../../assets/sfx/countdown_short.wav'),
  countdownLong: require('../../assets/sfx/countdown_long.wav'),
  transition: require('../../assets/sfx/transition.wav'),
};

export type SoundKey = keyof typeof assetMap;

class AudioManager {
  private loaded: Map<SoundKey, Audio.Sound> = new Map();
  private isEnabled = true;

  constructor() {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false }).catch(() => undefined);
  }

  enableAudio(value: boolean) {
    this.isEnabled = value;
  }

  async loadAsync(key: SoundKey) {
    if (this.loaded.has(key)) {
      return;
    }
    const sound = new Audio.Sound();
    await sound.loadAsync(assetMap[key], { shouldPlay: false, volume: 0.8 });
    this.loaded.set(key, sound);
  }

  async play(key: SoundKey) {
    if (!this.isEnabled) {
      return;
    }
    await this.loadAsync(key);
    const sound = this.loaded.get(key);
    if (!sound) {
      return;
    }
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
    await sound.replayAsync();
  }

  async unloadAll() {
    const unloadPromises = Array.from(this.loaded.values()).map((sound) => sound.unloadAsync());
    this.loaded.clear();
    await Promise.allSettled(unloadPromises);
  }
}

export const audioManager = new AudioManager();
