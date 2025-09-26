import * as Haptics from 'expo-haptics';

class HapticsManager {
  private isEnabled = true;

  enableHaptics(value: boolean) {
    this.isEnabled = value;
  }

  async pulse(type: 'success' | 'warning' | 'light') {
    if (!this.isEnabled) {
      return;
    }
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'light':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  }
}

export const hapticsManager = new HapticsManager();
