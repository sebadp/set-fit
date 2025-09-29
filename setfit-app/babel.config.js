module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // CRITICAL: react-native-reanimated/plugin MUST be the last plugin
      'react-native-reanimated/plugin',
    ],
  };
};