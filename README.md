# Accessible Progres bar / Range slider

[![npm version](https://img.shields.io/npm/v/aria-progress-range-slider.svg?style=flat-square)](https://www.npmjs.com/package/aria-progress-range-slider)
[![npm downloads](https://img.shields.io/npm/dm/aria-progress-range-slider.svg?style=flat-square)](https://www.npmjs.com/package/aria-progress-range-slider)

## What is this

As I haven't found one, I've tried to create simple to use, fully accessible slider component. Build is less than 2Kb;

It is written in TypeScript and I will be releasing React component soon.

### Features

* Fully accessible (based on [this example](https://www.w3.org/TR/wai-aria-practices/examples/slider/slider-1.html))
* Works on touch enabled devices (you can tap anywhere and drag)
* IE10+
* Support for both integers and float values (using `options.float`)
* Two value tooltips, one shown all the time, and one on hover
* Callback system
* Additional "buffer bar" that is controlled by the user
* Easy to style


### TODO

* [ ] API to update options (ATM only enable/disable is available)
* [ ] Better demo page
* [ ] Themes (YouTube-like, Vimeo-like...)
* [ ] React component
* [ ] Tests

## Usage

You'll need to import `ProgressBar` class and instantiate by passing two params.
The first one is `selectorOrElement` - CSS selector string or HTML element. This element will be used as a slider's wrapper, and library will create all needed elements inside it.

Two other one is the `options` object, and check below for more documenation on available options.

```js
ProgressBar(selectorOrElement:TSelectorOrElement, options:IProgressBarOptionsPartial);
```

You'll have to import CSS styling as well.

### Example:

```js
// Import the class
import ProgressBar from 'aria-progress-range-slider';
// and the CSS
import 'aria-progress-range-slider/dist/style.css';

const selector = '.progress-bar';
const options = {};

new ProgressBar(selector, options);
```


## Options

```js
// Slider accessible label
// Default: 'Seek slider'
ariaLabel?: string;

// If slider is labeled by another element,
// this should be the id of that element
// (Similar to how the "for" attribute is used to link a LABEL to an INPUT.)
ariaLabeledBy?: string;

// How much value will change on arrow keys
// Default: 1
arrowMoveStep?: number;

// Base CSS class name
// Default: 'AriaProgressBar'
//
// Note that all elements will use this one as a prefix
//
// Example:
// 'AriaProgressBar-track'
// 'AriaProgressBar-handle' ...
className?: string;

// When true disables the slider
// Default: false
disabled?: boolean;

// When true, slider will use floating numbers instead of integers
// Default: false
float?: boolean;

// Function that will be used to populate both tooltips (hover and main one)
// Params are current value and options
// Default: (value) => value.toString()
getTooltipText?(value: number, options?: IProgressBarOptions): string;

// Function that will be used to populate "aria-valuetext" attribute
// Params are current value and options
// Default: (value, options) => `${ value } ranging from ${ options.min } to ${ options.max }`
getValueText?(value: number, options?: IProgressBarOptions): string;

// Initial value
// Default: options.min (0)
initialValue?: number;

// Maximum value
// Default: 100
max?: number;

// Minimum value
// Default: 0
min?: number;

// Callback function that will be called every time
// slider's value changes
onChange?(value: number, options?: IProgressBarOptions): any;

// Callback function that will be called every time
// user finishes dragging the handle
onDragEnd?(value: number, options?: IProgressBarOptions): any;

// Callback function that will be called every time
// user moves the handle
onDragMove?(value: number, options?: IProgressBarOptions): any;

// Callback function that will be called every time
// user starts dragging the handle
onDragStart?(value: number, options?: IProgressBarOptions): any;

// How much value will change on page up and page down keys
// Default: 5
pageMoveStep?: number;

// If false, tooltips and the hover bar won't snap at values dividable by options.step
// Default: true
snap?: boolean;

// The stepping interval
// Default: 1
step?: number;
```

Please note that you can't hide elements through options (nor API). Just use CSS to hide them. I think it is a little bit cleaner than having a lot of conditions in the code.

### Elements and CSS classes

Default CSS class names are:

```scss
// Wrapper element
.AriaProgressBar {}
.AriaProgressBar--hover {}
.AriaProgressBar--dragging {}
.AriaProgressBar--disabled {}

// Main element, slider's track
.AriaProgressBar-track {}

// Progress bar
.AriaProgressBar-progress {}

// Hover bar, "fake" progress bar that shows on hover
// to indicate where will it jump on click
.AriaProgressBar-hover {}

// Same as hover bar, but controlled by you
// My intention was to use it as a buffer bar for media players
// (similar what YouTube does)
.AriaProgressBar-buffer {}

// Handle element
.AriaProgressBar-handle {}

// Tooltip that is always visible and displays slider's value
.AriaProgressBar-mainTooltip {}

// Tooltip that shows on hover and displays value
// slider will be changed to on click
.AriaProgressBar-hoverTooltip {}
```

Please note that if you change `options.className` it will use it instead of `AriaProgressBar`.

Check [https://github.com/Stanko/aria-progress-range-slider/blob/master/src/style.scss](styles.scss) to create your own theme. (Everything above `// Default theme` is mandatory for slider to work.)


## API

This is component's public API.

```js
// Removes all of the HTML elements
// and removes all listeners
destroy(): void;

// Gets slider's current value
getValue(): number;

// Sets value
setValue(value: number): void;

// Sets value for the buffer bar
setBufferValue(value: number): void;

// Disables the slider
disable(): void;

// Enables the slider
enable(): void;

// Removes all listeners
unbind(): void;
```


## Development

I'm using [Parcel](https://parceljs.org) for development and docs, while [microbundle](https://github.com/developit/microbundle) is used for npm builds.

For local development use:

```
npm start
```

It will start development server on http://localhost:1234/
