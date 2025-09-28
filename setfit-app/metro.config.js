const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = config.resolver;

config.resolver.assetExts = [...assetExts.filter((ext) => ext !== 'wasm'), 'wasm'];
config.resolver.sourceExts = Array.from(new Set([...sourceExts, 'web.js', 'web.ts', 'web.tsx']));

module.exports = config;
