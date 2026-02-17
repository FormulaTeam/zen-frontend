/**
 * CRACO - Allows customizing Create React App's webpack config without ejecting.
 * Used here to enable path aliases for cleaner imports.
 */
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@consts': path.resolve(__dirname, 'src/consts'),
      '@theme': path.resolve(__dirname, 'src/theme'),
    },
  },
};
