module.exports = function(api) {
  const isTest = api.env('test');

  api.cache.forever();

  const presets = [
    [
      '@babel/preset-env',
      ...(isTest ? [{ targets: { node: 'current' } }] : []),
    ],
    '@babel/preset-typescript',
  ];
  const plugins = [];

  return {
    presets,
    plugins,
  };
};
