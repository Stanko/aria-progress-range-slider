import { getElementLeft } from './helpers';

/*
|                                       | track
|=========                              | progress
|         O                             | handle
|       [ X ]                           | value tooltip
|---------------------------            | hover
|                        [ Y ]          | hover value tooltip
|--------------------                   | buffer
*/

// https://www.w3.org/TR/wai-aria-practices/examples/slider/slider-1.html

type TSelectorOrElement = HTMLElement | Element | string;

interface UIEvent {
  touches?: { pageX: number; }[];
  pageX?: number
  preventDefault():any
}

interface IProgressBarOptions {
  ariaLabel: string
  ariaLabeledBy?: string,
  arrowMoveStep: number
  className: string
  disabled: boolean
  float: boolean
  getTooltipText(value:number, options?:IProgressBarOptions):string
  getValueText(value:number, options?:IProgressBarOptions):string
  initialValue: number
  max: number
  min: number
  onChange?(value:number, options?:IProgressBarOptions):any
  onDragEnd?(value:number, options?:IProgressBarOptions):any
  onDragMove?(value:number, options?:IProgressBarOptions):any
  onDragStart?(value:number, options?:IProgressBarOptions):any
  pageMoveStep: number,
  snap: boolean
  step: number
}

interface IProgressBarOptionsPartial {
  ariaLabel?: string
  ariaLabeledBy?: string,
  arrowMoveStep?: number
  className?: string
  disabled?: boolean
  float?: boolean
  getTooltipText?(value:number, options?:IProgressBarOptions):string
  getValueText?(value:number, options?:IProgressBarOptions):string
  initialValue?: number
  max?: number
  min?: number
  onChange?(value:number, options?:IProgressBarOptions):any
  onDragEnd?(value:number, options?:IProgressBarOptions):any
  onDragMove?(value:number, options?:IProgressBarOptions):any
  onDragStart?(value:number, options?:IProgressBarOptions):any
  pageMoveStep?: number,
  snap?: boolean
  step?: number
}

const DEFAULT_OPTIONS:IProgressBarOptions = {
  ariaLabel: 'Seek slider',
  arrowMoveStep: 1,
  pageMoveStep: 5,
  className: 'AriaProgressBar',
  disabled: false,
  float: false,
  getTooltipText: (value:number, options:IProgressBarOptions) => {
    if (options.float) {
      return value.toString();
    }

    return Math.round(value).toString();
  },
  getValueText: (value:number, options:IProgressBarOptions) => {
    // TODO think of a more friendly label
    return `${ value } ranging from ${ options.min } to ${ options.max }`
  },
  initialValue: 0,
  max: 100,
  min: 0,
  snap: true,
  step: 1,
};

const keyCodes = {
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
}

class ProgressBar {
  // HTML Elements
  private element:HTMLElement;
  private handleElement:HTMLElement;
  private trackElement:HTMLElement;
  private progressElement:HTMLElement;
  private bufferElement:HTMLElement;
  private hoverElement:HTMLElement;
  private valueTooltipElement:HTMLElement;
  private hoverTooltipElement:HTMLElement;

  private options:IProgressBarOptions;
  private value:number;
  private realValue:number;
  private range:number;
  private isDragging:boolean = false;
  private isMouseOver:boolean = false;
  private isDestroyed:boolean = false;

  private elementLeft:number;

  constructor(selectorOrElement:TSelectorOrElement, options:IProgressBarOptionsPartial) {
    if (typeof selectorOrElement === 'string') {
      this.element = document.querySelector(selectorOrElement);
    } else {
      this.element = selectorOrElement as HTMLElement;
    }

    if (!(this.element instanceof HTMLElement)) {
      throw('Given HTML element is not valid or doesn\'t exist.')
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.range = this.options.max - this.options.min;

    this.createElements();

    if (this.options.disabled) {
      this.disable();
    }

    let value = 0;

    if (this.options.initialValue) {
      value = (this.options.initialValue - this.options.min) / this.range
    }

    this.updateValue(value);
    this.setAriaProps();


    // For IE only
    this.updateHoverTooltip(value);
  }

  // DOM

  private createElement(elementName:string, parentElement:HTMLElement) {
    const element = document.createElement('div');
    element.className = this.getClassName(elementName);

    parentElement.appendChild(element);

    return element;
  }

  private createElements() {
    this.trackElement = this.createElement('track', this.element);
    this.progressElement = this.createElement('progress', this.trackElement);
    this.hoverElement = this.createElement('hover', this.trackElement);
    this.bufferElement = this.createElement('buffer', this.trackElement);
    this.handleElement = this.createElement('handle', this.element);

    if (this.options.getTooltipText) {
      this.valueTooltipElement = this.createElement('mainTooltip', this.element);;
      this.hoverTooltipElement = this.createElement('hoverTooltip', this.element);
    }

    this.element.classList.add(this.options.className);

    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'slider');
    this.element.setAttribute('aria-valuemin', '0');

    this.setOptions();

    // Dragging
    // Touch events
    this.element.addEventListener('touchstart', this.handleDragStart);

    window.addEventListener('touchmove', this.handleTouchMove, {
      capture: false,
      passive: false,
    });
    window.addEventListener('touchend', this.handleDragEnd);

    // Dragging and hover
    // Mouse events
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
    this.element.addEventListener('mousedown', this.handleDragStart);

    window.addEventListener('mouseup', this.handleDragEnd);
    window.addEventListener('mousemove', this.handleMouseMove, false);

    // Keyboard events
    this.element.addEventListener('keydown', this.handleKeyDown);

    // TODO decide if mouse wheel support should be added
  }

  private getClassName(elementName:string, modifier:string = null) {
    if (modifier) {
      return `${ this.options.className }-${ elementName }--${ modifier }`;
    }

    return `${ this.options.className }-${ elementName }`;
  }

  // Event handlers

  private handleMouseEnter = () => {
    if (this.options.disabled) {
      return;
    }

    this.isMouseOver = true;
    this.elementLeft = getElementLeft(this.element);
    this.element.classList.add(`${ this.options.className }--hover`);
  }

  private handleMouseLeave = () => {
    this.isMouseOver = false;
    this.setHoverScale(0);
    this.element.classList.remove(`${ this.options.className }--hover`);
  }

  private handleDragStart = (e:UIEvent) => {
    if (this.options.disabled) {
      return;
    }

    this.isDragging = true;
    this.element.classList.add(`${ this.options.className }--dragging`);
    this.elementLeft = getElementLeft(this.element);

    const value = this.getValueFromEvent(e);
    this.updateValue(value);

    if (this.options.onDragStart) {
      this.options.onDragStart(this.realValue, this.options);
    }
  }

  private handleDragEnd = () => {
    if (this.isDragging) {
      if (this.options.onDragEnd) {
        this.options.onDragEnd(this.realValue, this.options);
      }

      if (this.options.onChange) {
        this.options.onChange(this.realValue, this.options);
      }
    }

    this.isDragging = false;
    this.element.classList.remove(`${ this.options.className }--dragging`);

    // TODO if need this for  IE only
    // this.updateHoverTooltip(this.value);
  }

  private handleMouseMove = (e:UIEvent) => {
    if (!this.isDragging && !this.isMouseOver || this.options.disabled) {
      return;
    }

    const value = this.getValueFromEvent(e);

    this.updateHoverTooltip(value);

    if (this.isDragging) {
      this.handleDragMove(value);
    } else if (this.isMouseOver) {
      this.setHoverScale(value);
    }
  }

  private handleTouchMove = (e:UIEvent) => {
    if (!this.isDragging || this.options.disabled) {
      return;
    }

    e.preventDefault();

    const value = this.getValueFromEvent(e);

    this.handleDragMove(value);
  }

  private handleDragMove(value:number) {
    const previousRealValue = this.realValue;
    this.updateValue(value);

    if (previousRealValue !== this.realValue && this.options.onDragMove) {
      this.options.onDragMove(this.realValue, this.options);
    }
  }

  private handleKeyDown = (e:KeyboardEvent) => {
    if (this.options.disabled) {
      return;
    }

    const stepArrow = this.options.arrowMoveStep / this.range;
    const stepPage = this.options.pageMoveStep / this.range;

    /*
      Up and Right arrows increase slider value for "arrowMoveStep" (default 1)
      Down and Left arrows decrease slider value for "arrowMoveStep" (default 1)
      Page Up	increases slider value for "pageMoveStep" (default 10)
      Page Down	decreases slider value for "pageMoveStep" (default 10)
      Home sets slider to its minimum value.
      End	sets slider to its maximum value.
    */
    const stepMap = {
      [keyCodes.HOME]: -1,
      [keyCodes.END]: 1,
      [keyCodes.PAGE_DOWN]: -stepPage,
      [keyCodes.PAGE_UP]: stepPage,
      [keyCodes.DOWN]: -stepArrow,
      [keyCodes.LEFT]: -stepArrow,
      [keyCodes.UP]: stepArrow,
      [keyCodes.RIGHT]: stepArrow,
    }

    const step = stepMap[e.keyCode];

    if (typeof step === 'number') {
      const previousRealValue = this.getRealValue();

      this.updateValue(this.includeStep(this.value + step));

      if (previousRealValue !== this.realValue && this.options.onChange) { // TODO
        this.options.onChange(this.realValue, this.options);
      }
    }
  }

  private getValueFromEvent(e:UIEvent) {
    const elementWidth = this.element.offsetWidth;
    let x;

    if (e.touches && e.touches.length === 1) {
      x = e.touches[0].pageX - this.elementLeft;
    } else if (e.pageX) {
      x = e.pageX - this.elementLeft;
    } else {
      return 0;
    }

    if (x < 0) {
      x = 0;
    } else if (x > elementWidth) {
      x = elementWidth;
    }

    return this.includeStep(x / elementWidth);
  }

  private setOptions() {
    this.element.setAttribute('aria-valuemax', this.options.max.toString());
    this.element.setAttribute('aria-label', this.options.ariaLabel);

    if (this.options.ariaLabeledBy) {
      this.element.setAttribute('aria-labeledby', this.options.ariaLabeledBy);
    }
  }

  private setAriaProps() {
    this.element.setAttribute('aria-valuenow', this.realValue.toString());
    this.element.setAttribute('aria-valuetext', this.options.getValueText(this.realValue, this.options))
  }

  private limitValue(value:number) {
    if (value < 0) {
      return 0;
    } else if (value > 1) {
      return 1;
    }

    return value;
  }

  private includeStep(value:number) {
    const step = this.options.step / this.range;

    if (this.options.snap) {
      value = Math.round(value / step) * step;
      value = value * this.range / this.range;
    }

    value = this.limitValue(value);

    return value;
  }

  private updateTooltip(value:number, realValue:number, element:HTMLElement) {
    if (this.options.getTooltipText) {
      element.style.left = `${ value * 100 }%`;
      element.innerHTML = this.options.getTooltipText(realValue, this.options);
    }
  }

  private updateValueTooltip(value:number) {
    this.updateTooltip(value, this.realValue, this.valueTooltipElement);
  }

  private updateHoverTooltip(value:number) {
    const hoverValue = value * this.range + this.options.min;

    this.updateTooltip(value, parseFloat(hoverValue.toFixed(4)), this.hoverTooltipElement);
  }

  private updateValue(value:number) {
    this.handleElement.style.left = `${ value * 100 }%`;
    this.progressElement.style.transform = `scaleX(${ value })`;

    if (this.value !== value || typeof value === 'undefined') {
      const previousRealValue = this.getRealValue();

      this.value = value;
      this.realValue = this.getRealValue();

      if (this.realValue !== previousRealValue) {
        this.setAriaProps();
        this.updateValueTooltip(value);
      }

      if (this.isDragging) {
        this.setHoverScale(0);
      }
    }
  }

  private setHoverScale(value:number) {
    this.hoverElement.style.transform = `scaleX(${ value })`;
  }

  private getRealValue() {
    const value = this.value * this.range + this.options.min;

    return parseFloat(value.toFixed(4));
  }

  private unbind() {
    // Touch events
    this.element.removeEventListener('touchstart', this.handleDragStart);

    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleDragEnd);

    // Dragging and hover
    // Mouse events
    this.element.removeEventListener('mouseenter', this.handleMouseEnter);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.removeEventListener('mousedown', this.handleDragStart);

    window.removeEventListener('mouseup', this.handleDragEnd);
    window.removeEventListener('mousemove', this.handleMouseMove);

    // Keyboard events
    this.element.removeEventListener('keydown', this.handleKeyDown);
  }

  // Public
  public getValue() {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is destroyed, options: ', this.options);
      return;
    }

    return this.realValue;
  }

  public setValue(value:number) {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is destroyed, options: ', this.options);
      return;
    }

    if (this.isDragging) {
      return;
    }

    this.updateValue(this.includeStep(value / this.range));
  }

  public setBufferValue(value:number) {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is destroyed, options: ', this.options);
      return;
    }

    this.bufferElement.style.transform = `scaleX(${ value / this.range })`;
  }

  public disable() {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is destroyed, options: ', this.options);
      return;
    }

    this.options.disabled = true;
    this.element.classList.add(`${ this.options.className }--disabled`);
    this.element.setAttribute('aria-disabled', 'true');
    this.element.setAttribute('disabled', 'true');
    this.element.setAttribute('tabindex', '-1');
  }

  public enable() {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is destroyed, options: ', this.options);
      return;
    }

    this.options.disabled = false;
    this.element.classList.remove(`${ this.options.className }--disabled`);
    this.element.setAttribute('tabindex', '0');
  }

  public destroy() {
    if (this.isDestroyed) {
      console.warn('ProgressBar instance is already destroyed');
      return;
    }

    // Unbind everything
    this.unbind();

    // Empty element
    this.element.innerHTML = '';


    this.isDestroyed = true;

    this.element.classList.remove(this.options.className);

    this.element.removeAttribute('tabindex');
    this.element.removeAttribute('role');
    this.element.removeAttribute('aria-valuemin');
    this.element.removeAttribute('aria-valuemax');
    this.element.removeAttribute('aria-label');
    this.element.removeAttribute('aria-valuenow');
    this.element.removeAttribute('aria-valuetext');

    if (this.options.ariaLabeledBy) {
      this.element.removeAttribute('aria-labeledby');
    }
  }
}

export default ProgressBar;

