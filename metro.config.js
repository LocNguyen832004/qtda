const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.join(projectRoot, 'node_modules', 'expo', 'node_modules', '@expo', 'cli'),
];

module.exports = config;
