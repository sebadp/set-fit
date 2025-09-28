import { Platform } from 'react-native';

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  const chunk = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;
  const intVal = parseInt(chunk, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
};

const formatColor = (color, opacity) => {
  if (!color) {
    return `rgba(0,0,0,${opacity})`;
  }
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return color;
  }
  if (color.startsWith('#')) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return color;
};

export const createShadow = ({
  elevation = 4,
  offsetX = 0,
  offsetY = 4,
  blurRadius = 12,
  opacity = 0.2,
  color = '#000',
  spread = 0,
} = {}) =>
  Platform.select({
    web: {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${spread}px ${formatColor(color, opacity)}`,
    },
    default: {
      elevation,
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blurRadius,
    },
  });

export const createTextShadow = ({
  offsetX = 0,
  offsetY = 2,
  blurRadius = 4,
  color = 'rgba(0,0,0,0.3)',
} = {}) =>
  Platform.select({
    web: {
      textShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`,
    },
    default: {
      textShadowColor: color,
      textShadowOffset: { width: offsetX, height: offsetY },
      textShadowRadius: blurRadius,
    },
  });
