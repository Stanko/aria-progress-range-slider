# Accessible Progres bar / Range slider

[![npm version](https://img.shields.io/npm/v/aria-progress-range-slider.svg?style=flat-square)](https://www.npmjs.com/package/aria-progress-range-slider)
[![npm downloads](https://img.shields.io/npm/dm/aria-progress-range-slider.svg?style=flat-square)](https://www.npmjs.com/package/aria-progress-range-slider)

## What is this

As I haven't one, I've tried to create simple to use, fully accessible slider component.

It is written in TypeScript and I will be releasing React component soon.


## I'm still working on the documentation.

But the library itself is fully functional.


## Usage

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
ariaLabel?: string;
ariaLabeledBy?: string;
arrowMoveStep?: number;
className?: string;
disabled?: boolean;
float?: boolean;
getTooltipText?(value: number, options?: IProgressBarOptions): string;
getValueText?(value: number, options?: IProgressBarOptions): string;
initialValue?: number;
max?: number;
min?: number;
onChange?(value: number, options?: IProgressBarOptions): any;
onDragEnd?(value: number, options?: IProgressBarOptions): any;
onDragMove?(value: number, options?: IProgressBarOptions): any;
onDragStart?(value: number, options?: IProgressBarOptions): any;
pageMoveStep?: number;
snap?: boolean;
step?: number;
```


## API

```js
getValue(): number;
setValue(value: number): void;
setBufferValue(value: number): void;
disable(): void;
enable(): void;
```
