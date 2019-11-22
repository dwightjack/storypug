const pug = require('pug');

function resolveFunctions(functions) {
  if (typeof functions === 'string') {
    return require(functions);
  }
  return functions;
}

const createPugRenderer = (baseOptions = {}) => {
  const opts = {
    pretty: true,
    ...baseOptions,
  };

  if (baseOptions.functions) {
    Object.assign(opts, resolveFunctions(baseOptions.functions));
    delete opts.functions;
  }

  return {
    render: (tmpl, options = {}) =>
      pug.render(tmpl, Object.assign({}, opts, options)),
    compile: (tmpl, options = {}) =>
      pug.compile(tmpl, Object.assign({}, opts, options)),
  };
};

module.exports = createPugRenderer;
