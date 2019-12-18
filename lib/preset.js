const { resolve } = require('path');

async function webpack(config, options = {}) {
  const {
    loaderOptions = {},
    include,
    babel = false,
    babelLoaderOptions,
  } = options;

  const loaders = [
    {
      loader: resolve(__dirname, './webpack-loader.js'),
      options: loaderOptions,
    },
  ];

  if (babel) {
    loaders.unshift({
      loader: 'babel-loader',
      options: babelLoaderOptions,
    });
  }

  config.module.rules.push({
    test: /\.pug$/,
    include: include,
    use: loaders,
  });

  return config;
}

module.exports = {
  webpack,
};
