/**
 * CRA webpack override to polyfill Node built-ins Mol* pulls in (e.g., path).
 */
module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    path: require.resolve('path-browserify'),
    crypto: false,
    fs: false,
  };
  return config;
};
