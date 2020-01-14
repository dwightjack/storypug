# Storypug

Storypug makes it easy and more straightforward to use [pug](https://pugjs.org) mixins as components inside [Storybook](https://storybook.js.org) (and, incidentally, [Jest](https://jestjs.io/)).

In a nutshell Storypug let's you import [pug mixins](https://pugjs.org/language/mixins.html) as functions and render them to HTML with options.

<!-- TOC depthTo:4 -->

- [Installation](#installation)
- [Code Requirements](#code-requirements)
- [Storybook configuration](#storybook-configuration)
  - [As a preset](#as-a-preset)
    - [Storybook 5.3+](#storybook-53)
    - [Storybook <=5.2](#storybook-52)
  - [Manual Setup](#manual-setup)
  - [Loader Options](#loader-options)
- [Usage in Stories](#usage-in-stories)
  - [Render Helpers](#render-helpers)
  - [Render to a DOM Element](#render-to-a-dom-element)
  - [Usage with `@storybook/addon-knobs`](#usage-with-storybookaddon-knobs)
  - [Decorators](#decorators)
    - [`withStyle`](#withstyle)
    - [`fullscreen`](#fullscreen)
    - [`withWrap`](#withwrap)
- [Usage with Jest](#usage-with-jest)
  - [Configuration](#configuration)
  - [Writing tests](#writing-tests)

<!-- /TOC -->

## Installation

First of all setup Storybook for HTML following [this guide](https://storybook.js.org/docs/guides/guide-html/).

Then you need to install both `pug` and `pug-runtime` alongside `storypug`:

```sh
npm i pug pug-runtime storypug -D
```

**Note:** If you're using ES6+ features inside pug templates (like `const` and `() => {}`) and want to target older browsers you need to install `babel-loader` as well.

```sh
npm i babel-loader -D
```

## Code Requirements

In order for Storypug to work correctly you are required to define exactly **one mixin per file**.

## Storybook configuration

### As a preset

#### Storybook 5.3+

Add the following to `.storybook/main.js`:

```js
module.exports = {
  addons: ['storypug'],
};
```

You can customize the preset with the following options:

| name                 | type     | default | description                                           |
| -------------------- | -------- | ------- | ----------------------------------------------------- |
| `include`            | string[] |         | [Include rule][1] for `/\.pug?\$/`                    |
| `babel`              | boolean  | false   | Transpile the pug template with babel                 |
| `babelLoaderOptions` | object   |         | (Optional) `babel-loader` custom options              |
| `loaderOptions`      | object   |         | (Optional) Storypug loader [options](#loader-options) |

[1]: https://webpack.js.org/configuration/module/#ruleinclude

Example:

```js
module.exports = {
  addons: [
    {
      name: 'storypug',
      options: {
        babel: true, //use babel-loader
        loaderOptions: {
          root: 'src/components', // use src components as the pug root inclusion path
        },
      },
    },
  ],
};
```

#### Storybook <=5.2

Add the following to `.storybook/preset.js`:

```js
module.exports = ['storypug/preset'];
```

Or with options:

```js
module.exports = [
  {
    name: 'storypug/preset',
    options: {
      babel: true, //use babel-loader
      loaderOptions: {
        root: 'src/components', // use src components as the pug root inclusion path
      },
    },
  },
];
```

### Manual Setup

1. Create a `.storybook/webpack.config.js` file in your project's root folder.
1. Add the module loader for `.pug` files:

```js
module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.pug$/,
    use: ['storypug/lib/webpack-loader.js'],
  });
  return config;
};
```

1. If you're using ES6+ features and you target old browsers add `babel-loader` before the Storypug loader.

```diff
module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.pug$/,
-   use: ['storypug/lib/webpack-loader.js'],
+   use: ['babel-loader', 'storypug/lib/webpack-loader.js'],
  });
  return config;
};
```

### Loader Options

Storypug's webpack loader is a wrapper around [pug-loader](https://github.com/pugjs/pug-loader), and thus any [option](https://github.com/pugjs/pug-loader#options) set in the configuration will be forwarded to it:

```js
module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.pug\$/,
    use: [
      {
        loader: 'storypug/lib/webpack-loader.js',
        options: {
          root: '/path/to/base-dir',
          // ^-- root directory used for absolute includes
        },
      },
    ],
  });
  return config;
};
```

## Usage in Stories

**Note: This documentation uses Storybook's [Component Story Format](https://storybook.js.org/docs/formats/component-story-format/), but the [storiesOf API](https://storybook.js.org/docs/formats/storiesof-api/) is supported as well.**

Now that you have configured Storybook to handle `.pug` files, you can import them like JavaScript modules. The imported module will be a function accepting an object with the following properties:

- `props`: An object passed as the first argument of the mixin
- `contents`: an optional HTML string rendered at the mixin's `block`
- `...`: any other property will be avaiable as pug locals.

The function will return the rendered template as a string.

```pug
//- components/example.pug

mixin Example (props = {})
  - const intro = startCase(props.intro)
  .example
    p.example__intro= props.intro
    .example__body
      block
```

```js
// components/example.stories.js

import startCase from 'lodash/startCase';
import Example from './example.pug';

export default {
  title: 'Example',
};

export const Basic = () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

  return Example({ props, contents, startCase });
};
```

The output of the `default` story will be:

```html
<div class="example">
  <p class="example__intro">This Is An Intro</p>
  <div class="example__body"><p>Example body</p></div>
</div>
```

### Render Helpers

To ease the developer experience, and provide some useful defaults, Storypug provides a handy render helpers.

```diff
// components/example.stories.js

import startCase from 'lodash/startCase';
+ import { renderer } from 'storypug';
import Example from './example.pug';

+ // pass here shared locals like functions and variables
+ const { html } = renderer({ startCase });

export default {
  title: 'Example',
};

export const Basic = () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

- return Example({ props, contents, startCase });
+ return html(Example, props, contents);
};
```

### Render to a DOM Element

Storybook HTML accepts both strings and DOM elements. To render the template to a DOM element use the `render` helper instead of `html`:

```diff
// components/example.stories.js

import startCase from 'lodash/startCase';
import { renderer } from 'storypug';
import Example from './example.pug';

  // pass here shared locals like functions and variables
- const { html } = renderer({ startCase });
+ const { render } = renderer({ startCase });

export default {
  title: 'Example',
};

export const Basic = () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

- return html(Example, props, contents);
+ const wrapper = render(Example, props, contents);
+ return wrapper.$root;
};
```

The `wrapper` object returned by `render` has the following properties:

- `$root`: a reference to the rendered mixin root element
- `$raw`: the rendered mixin HTML as a string
- `el`: the wrapper DOM element itself
- `html()`: function returning the rendered mixin HTML as a string
- `outer()`: function returning the wrapper HTML as a string
- `find(selector)`: a shortcut to `el.querySelector(selector)`
- `findAll(selector)`: a shortcut to `el.querySelectorAll(selector)`

**Note** that `$raw` differs from `html()` in that the former is a reference to the HTML generated at render time while the latter will reflect any manipulation applied after rendering.

### Usage with `@storybook/addon-knobs`

Another benefit of Storypug is the ability to use addons like [@storybook/addon-knobs](https://www.npmjs.com/package/@storybook/addon-knobs) with ease.

```pug
//- components/checkbox.pug

mixin Checkbox(props={})
  input.checkbox(type="checkbox" value=props.value checked=!!props.checked)
```

```js
// components/checkbox.stories.js

import { boolean } from '@storybook/addon-knobs';
import { renderer } from 'storypug';
import Checkbox from './checkbox.pug';

const { html } = renderer();
const defaultProps = { value: 'on' };

export default {
  title: 'Checkbox',
};

export const Basic = () => {
  const checked = boolean('Checked', false);

  return html(Checkbox, { ...defaultProps, checked });
};
```

### Decorators

Storypug provides some useful decorators as well:

#### `withStyle`

This decorator will wrap the rendered HTML in a DOM element with custom styles.
The decorator can be configured by setting the `style` parameter:

```js
// ...
import { withStyle } from 'storypug';

const globalStyle = {
  backgroundColor: 'black',
};

const lightStyle = {
  backgroundColor: 'white',
};

export default {
  title: 'Checkbox',
  decorators: [withStyle],
  parameters: {
    style: globalStyle,
  },
};

export const Basic = () => html(Checkbox);

export const Light = () => html(Checkbox);

Light.story = {
  parameters: [{ style: lightStyle }],
};
```

In the above example the `default` story will wrap the checkbox in a container with black background, while the `light` story will have it white.

To skip the decorator in a story set the `style` parameter to `false`.

**Note**: the `style` parameter accepts style objects, class names or an array of those. This makes it easy to use packages like [emotion](https://emotion.sh/) for styling:

```js
// ...
import { withStyle } from 'storypug';
import { css } from 'emotion';

// lightStyle is a unique class name
const lightStyle = css`
  background-color: white;
`;

const redText = {
  color: 'red',
};

export default {
  title: 'Checkbox',
  decorators: [withStyle],
};

// ...

export const LightAndRed = () => html(Checkbox);

LightAndRed.story = {
  parameters: {
    style: [lightStyle, redText],
  },
};
```

#### `fullscreen`

Works like `withStyle` but will add a `fullscreen` class name by default to the wrapper. This decorator is useful if you need to reset any default spacing added to the storybook's preview panel. Like `withStyle` accepts additional classes and styles via the `fullscreen` parameter.

If you want to rename the default `fullscreen` class name to something else you can do so by setting the `fullscreen.baseClass` property:

```js
import { fullscreen } from 'storypug';

fullscreen.baseClass = 'custom-fullscreen';

export default {
  title: 'Story name',
  decorators: [fullscreen],
  parameters: { fullscreen: 'additional-class' },
};
```

To skip the decorator in a story set the `fullscreen` parameter to `false`.

#### `withWrap`

Works like `withStyle` but lets you define the tag name of the wrapper element (defaults to `div`):

```js
// wrap the story with <section class="my-class" />

// ...
export default {
  title: 'Story name',
  decorators: [withWrap],
  parameters: { wrap: { style: 'my-class', tag: 'section' } },
};
```

To skip the decorator in a story set the `wrap` parameter to `false`.

## Usage with Jest

Storypug lets you use the same patterns you're using in stories to render pug templates inside Jest.

This feature can be useful paired with [snapshot testing](https://jestjs.io/docs/en/snapshot-testing) and [DOM testing](https://testing-library.com/docs/dom-testing-library/intro)

### Configuration

Add a transform for pug files in your `jest.config.js` file:

```diff
module.exports = {
  // ...
  transform: {
+    '\\.pug$': 'storypug/lib/pug-jest.js',
  },
};
```

You can customize the pug [settings](https://pugjs.org/api/reference.html#options) by using `jest.globals`:

```diff
module.exports = {
  // ...
+ globals: {
+   'pug-jest': {
+     basedir: '<rootDir>',
+   },
+ },
  transform: {
    '\\.pug$': 'storypug/lib/pug-jest.js',
  },
};
```

### Writing tests

Once configured, you can import your templates and use the render helpers as described in the [Storybook section](#usage-in-stories).
