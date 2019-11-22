const pug = require('pug');

const createPugRenderer = (baseOptions = {}) => {
  const opts = {
    pretty: true,
    ...baseOptions,
  };

  return {
    render: (tmpl, options = {}) =>
      pug.render(tmpl, Object.assign({}, opts, options)),
    compile: (tmpl, options = {}) =>
      pug.compile(tmpl, Object.assign({}, opts, options)),
  };
};

module.exports = createPugRenderer;
