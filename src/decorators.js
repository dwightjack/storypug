const WRAPPER_ID = 'storypug-wrapper';

function getOrCreate(id, styles = []) {
  const elementOnDom = document.getElementById(id);

  if (elementOnDom) {
    elementOnDom.parentElement.removeChild(elementOnDom);
  }

  const element = document.createElement('div');
  element.id = id;
  element.className = '';
  element.removeAttribute('style');

  styles.forEach((style) => {
    if (typeof style === 'string') {
      element.classList.add(style);
    } else {
      Object.assign(element.style, style);
    }
  });

  return element;
}

// TODO: return the element node when https://github.com/storybooks/storybook/issues/5017 is resolved
function append(wrapper, component, asString = true) {
  if (typeof component === 'string') {
    wrapper.innerHTML = component;
  } else {
    wrapper.textContent = '';
    wrapper.appendChild(component);
  }
  return asString ? wrapper.outerHTML : wrapper;
}

export const withStyle = (style, { asString } = {}) => (
  storyFn,
  { parameters = {} } = {},
) => {
  if (parameters.style === false) {
    return storyFn();
  }
  const wrapper = getOrCreate(
    WRAPPER_ID,
    [style].concat(parameters.style).filter((x) => x),
  );
  return append(wrapper, storyFn(), asString);
};

export const fullscreen = (
  className,
  { asString, baseClass = 'fullscreen' } = {},
) => (storyFn, { parameters = {} } = {}) => {
  if (parameters.fullscreen === false) {
    return storyFn();
  }
  const wrapper = getOrCreate(`${WRAPPER_ID}--fullscreen`);
  [baseClass, className].forEach((name) => {
    if (name) {
      wrapper.classList.add(name);
    }
  });
  return append(wrapper, storyFn(), asString);
};

export const withWrap = (className, { asString, tag = 'div' } = {}) => (
  storyFn,
  { parameters = {} } = {},
) => {
  if (parameters.wrap === false) {
    return storyFn();
  }
  const wrapper = document.createElement(tag);
  wrapper.className = parameters.wrap || className;
  return append(wrapper, storyFn(), asString);
};
