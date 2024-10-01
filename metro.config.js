// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  const { resolver } = defaultConfig;

  resolver.extraNodeModules = {
    buffer: require.resolve('buffer/'),
  };

  return defaultConfig;
})();
