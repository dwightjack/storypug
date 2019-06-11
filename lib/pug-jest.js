const createPugRenderer = require('./renderer');
const { normalize, relative } = require('path');
const { MIXINS_REGEXP } = require('./constants');

function resolve(str, { rootDir }) {
  return normalize(str.replace('<rootDir>', rootDir));
}

function getOptions(jestConfig) {
  const opts =
    jestConfig && jestConfig.globals && jestConfig.globals['pug-jest'];

  if (!opts) {
    return {
      basedir: process.cwd(),
    };
  }

  if (!opts.basedir) {
    opts.basedir = process.cwd();
  }

  Object.keys(opts).forEach((k) => {
    if (typeof opts[k] === 'string') {
      opts[k] = resolve(opts[k], jestConfig);
    }
  });
  return opts;
}

module.exports = {
  process(src, filename, options) {
    const opts = getOptions(options);
    const renderer = createPugRenderer(opts);
    let template = `include /${relative(opts.basedir, filename)}`;
    const matches = src.trim().match(MIXINS_REGEXP);
    if (matches) {
      const name = matches[1];
      template += `\nif contents\n  +${name}(props)\n    | !{contents}\nelse\n  +${name}(props)\n`;
    }

    return `
      const pug = require('pug-runtime');
      module.exports = ${renderer.compile(template, { filename })};
    `;
  },
};
