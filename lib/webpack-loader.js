const loader = require('pug-loader');
const { MIXINS_REGEXP } = require('./constants');

module.exports = function(src) {
  this.cacheable && this.cacheable();
  const matches = src.trim().match(MIXINS_REGEXP);
  if (!matches) {
    return loader.call(this, src);
  }
  const name = matches[1];
  return loader.call(
    this,
    `${src}\nif contents\n  +${name}(props)\n    | !{contents}\nelse\n  +${name}(props)\n`,
  );
};
