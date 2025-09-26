const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure alias for @/ to point to src/
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
};

module.exports = config;