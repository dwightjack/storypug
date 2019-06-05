const renderFnWarn = () => {
  throw new Error('You must define a custom render function');
};

const renderer = (functions = {}, locals = {}, renderFn = renderFnWarn) => {
  const baseOpts = { ...functions, ...locals };

  function html(Component, props = {}, contents) {
    if (typeof Component === 'function') {
      return Component(Object.assign({ props, contents }, baseOpts));
    }
    // render pug template
    return renderFn(Component, { props });
  }

  function wrap(string) {
    const el = document.createElement('div');
    el.innerHTML = string;

    if (el.firstElementChild) {
      el.firstElementChild.$$raw = el.innerHTML;
    }

    return {
      el,
      $raw: el.innerHTML,
      find: (selector) => el.querySelector(selector),
      findAll: (selector) => el.querySelectorAll(selector),
      html: () => el.innerHTML,
      outer: () => el.outerHTML,
      get $root() {
        if (el.childElementCount === 1) {
          return el.firstElementChild;
        }
        throw new Error(
          'Unable to access root element of a multi-children component',
        );
      },
    };
  }

  function render(Component, props, contents) {
    return wrap(html(Component, props, contents));
  }

  const elMap = new Map();
  function inject(el, ctx = document.body) {
    elMap.set(el, ctx);
    return ctx.appendChild(el);
  }

  function cleanup() {
    for (const [el, ctx] of elMap) {
      try {
        ctx.removeChild(el);
      } catch (e) {
        console.error(e); // eslint-disable-line no-console
      }
    }
  }

  return {
    html,
    render,
    wrap,
    inject,
    cleanup,
  };
};

export { renderer };
