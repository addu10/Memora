const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports support (required for modern libraries like lucide-react-native)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
