# storypug

Storypug makes it easy and more straightforward to use [pug](https://pugjs.org) mixins as components inside [Storybook](https://storybook.js.org) (and, incidentally, [Jest](https://jestjs.io/))

In a nutshell storypug let's you import [pug mixins](https://pugjs.org/language/mixins.html) as functions and render them to HTML with options.

## Installation

First of all setup Storybook for HTML following [this guide](https://storybook.js.org/docs/guides/guide-html/).

Then you need to install both `pug` and `pug-runtime` alongside storypug:

```sh
npm i pug pug-runtime storypug -D
```

**Note:** If you're using ES6+ features inside pug templates (like `const` and `() => {}`) and want to target older browsers you need to install `babel-loader` as well.

```sh
npm i babel-loader -D
```

## Code Requirements

In order for storypug to work correctly you are required to define exactly **one mixin for file**.

## Storybook configuration

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

1. If using ES6+ features and you're targeting old browsers add `babel-loader` before the storypug loader.

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

The webpack loader is a wrapper around [pug-loader](https://github.com/pugjs/pug-loader) and thus will forward to it any [configuration option](https://github.com/pugjs/pug-loader#options):

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

Now that you have configured Storybook to handle `.pug` files, you can import them like JavaScript modules. The imported module will be a function that will render the mixin with options and block contents.

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

import { storiesOf } from '@storybook/html';
import startCase from 'lodash/startCase';
import Example from './example.pug';

storiesOf('Example', module).add('default', () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

  return Example({ props, contents, startCase });
});
```

The output used for the `default` story will be:

```html
<div class="example">
  <p class="example__intro">This Is An Intro</p>
  <div class="example__body"><p>Example body</p></div>
</div>
```

### Render Helpers

To ease the developer experience and provide some useful defaults storypug provides a handy render helpers.

```diff
// components/example.stories.js

import { storiesOf } from '@storybook/html';
import startCase from 'lodash/startCase';
+ import { renderer } from 'storypug';
import Example from './example.pug';

+ // pass here shared locals like functions and variables
+ const { html } = renderer({ startCase });

storiesOf('Example', module).add('default', () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

- return Example({ props, contents, startCase });
+ return html(Example, props, contents);
});
```

### Render to a DOM Element

Storybook HTML accepts both strings and DOM elements. To render the mixin to a DOM element use the `render` helper:

```diff
// components/example.stories.js

import { storiesOf } from '@storybook/html';
import startCase from 'lodash/startCase';
+ import { renderer } from 'storypug';
import Example from './example.pug';

  // pass here shared locals like functions and variables
- const { html } = renderer({ startCase });
+ const { render } = renderer({ startCase });

storiesOf('Example', module).add('default', () => {
  // setup properties
  const props = { intro: 'This is an intro' };
  // this HTML will be rendered inside the mixin's block
  const contents = '<p>Example body</p>';

- return html(Example, props, contents);
+ const wrapper = render(Example, props, contents);
+ return wrapper.$root;
});
```

The `wrapper` object returned by `render` has the following properties:

- `$root`: reference to the rendered mixin root element
- `$raw`: the rendered mixin HTML as a string
- `el`: the wrapper DOM element itself
- `html()`: function returning the rendered mixin HTML as a string
- `outer()`: function returning the wrapper HTML as a string
- `find(selector)`: a shortcut to `el.querySelector(selector)`
- `findAll(selector)`: a shortcut to `el.querySelectorAll(selector)`

Note that `$raw` differs from `html()` in that the former is a reference to the HTML generated at render time while the latter reflects any manipulation applied after rendering.

### Usage with @storybook/addon-knobs

Another benefit of `storypug` is the ability to use addons like [@storybook/addon-knobs](https://www.npmjs.com/package/@storybook/addon-knobs) with ease.

```pug
//- components/checkbox.pug

mixin Checkbox(props={})
  input.checkbox(type="checkbox" value=props.value checked=!!props.checked)
```

```js
// components/checkbox.stories.js

import { storiesOf } from '@storybook/html';
import { boolean } from '@storybook/addon-knobs';
import { renderer } from 'storypug';
import Checkbox from './checkbox.pug';

const { html } = renderer();
const defaultProps = { value: 'on' };

storiesOf('Checkbox', module).add('default', () => {
  const checked = boolean('Checked', false);

  return html(Checkbox, { ...defaultProps, checked });
});
```

### Decorators

`storypug` provides some useful decorators as well:

#### `withStyle`

This decorator will wrap the rendered HTML in a DOM element with custom styles.
The decorator can be configured globally by passing styles at invocation time or locally by mean of the `style` parameter:

```js
// ...
import { withStyle } from 'storypug';

const globalStyle = {
  backgroundColor: 'black',
};

const lightStyle = {
  backgroundColor: 'white',
};

storiesOf('Checkbox', module)
  .addDecorator(withStyle(globalStyle))
  .add('default', () => html(Checkbox))
  .add('light', () => html(Checkbox), { style: lightStyle });
```

In the above example the `default` story will wrap the checkbox in a container with black background, while the `light` story will have it white.

To skip the decorator in a story set the `style` parameter to `false`.

**Note**: both `withStyle` and the `style` parameter accepts style objects, class names or an array of those. This makes is easy to use packages like [emotion](https://emotion.sh/) for local styling

```js
// ...
import { withStyle } from 'storypug';
import { css } from 'emotion';

const globalStyle = {
  backgroundColor: 'black',
};

// lightStyle is a unique class name
const lightStyle = css`
  background-color: white;
`;

const redText = {
  color: 'red',
};

storiesOf('Checkbox', module)
  .addDecorator(withStyle(globalStyle))
  .add('default', () => html(Checkbox))
  .add('light and red', () => html(Checkbox), { style: [lightStyle, redText] });
```

#### `fullscreen`

Works like `withStyle` but will add a `fullscreen` class name by default to the wrapper. This decorator is useful if you need to reset any default spacing added to the storybook's preview panel. Like `withStyle` accepts additional classes and styles both as a global styling and via the `fullscreen` parameter.

If you want to rename the default `fullscreen` class name to something else you can do so by passing an option object as second argument:

```js
// ...
.addDecorator(fullscreen(null, { baseClass: 'custom-fullscreen'}))
```

To skip the decorator in a story set the `fullscreen` parameter to `false`.

#### `withWrap`

Works like `withStyle` but let's you define the tag name you want to wrap the HTML with (defaults to `div`):

```js
// ...
.addDecorator(withWrap(myStyle, { tag: 'section' }))
```

Like `withStyle` accepts additional classes and styles both as a global styling and via the `wrap` parameter.

To skip the decorator in a story set the `wrap` parameter to `false`.
