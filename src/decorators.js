import { makeDecorator } from '@storybook/addons';

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

function append(wrapper, component) {
  if (typeof component === 'string') {
    wrapper.innerHTML = component;
    return wrapper.outerHTML;
  }
  wrapper.textContent = '';
  wrapper.appendChild(component);
  return wrapper;
}

export const withStyle = makeDecorator({
  name: 'withStyle',
  parameterName: 'style',
  skipIfNoParametersOrOptions: true,
  wrapper(getStory, context, { parameters }) {
    if (parameters === false) {
      return getStory(context);
    }
    const wrapper = getOrCreate(
      WRAPPER_ID,
      [].concat(parameters).filter((x) => x),
    );
    return append(wrapper, getStory(context));
  },
});

export const fullscreen = makeDecorator({
  name: 'fullscreen',
  parameterName: 'fullscreen',
  skipIfNoParametersOrOptions: false,
  wrapper(getStory, context, { parameters }) {
    if (parameters === false) {
      return getStory(context);
    }
    const wrapper = getOrCreate(
      `${WRAPPER_ID}--fullscreen`,
      [fullscreen.baseClass].concat(parameters).filter((x) => x),
    );
    return append(wrapper, getStory(context));
  },
});

fullscreen.baseClass = 'fullscreen';

export const withWrap = makeDecorator({
  name: 'withWrap',
  parameterName: 'wrap',
  skipIfNoParametersOrOptions: true,
  wrapper(getStory, context, { parameters = {} }) {
    if (parameters === false) {
      return getStory(context);
    }
    const { tag = 'div', style } = parameters;

    const wrapper = document.createElement(tag);
    [].concat(style).forEach((style) => {
      if (!style) {
        return;
      }
      if (typeof style === 'string') {
        wrapper.classList.add(style);
      } else {
        Object.assign(wrapper.style, style);
      }
    });
    return append(wrapper, getStory(context));
  },
});
