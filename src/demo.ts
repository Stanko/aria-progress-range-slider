import ProgressBar from './index';
////////////// DEMO

function addTimeZero(value:number):string {
  if (value < 10) {
    return `0${ value }`
  }

  return value.toString();
}

function formatTime(seconds:number):string {
  if (seconds < 60) {
    return `00:${ addTimeZero(seconds) }`
  }

  const minutes = Math.floor(seconds / 60);
  const leftoverSeconds = seconds % 60;

  return `${ addTimeZero(minutes) }:${ addTimeZero(leftoverSeconds) }`
}

const trackOne = new ProgressBar('#track-one', {
});

const trackTwo = new ProgressBar(document.querySelector('#track-two'), {
  float: true,
  max: 300,
  snap: false,
  getTooltipText: (value, options) => {
    const seconds = Math.round(value);

    return `${ formatTime(seconds) }`
  },
  getValueText: (value, options) => {
    return `${ formatTime(Math.round(value)) } of ${ formatTime(options.max) }`
  },
  onChange: value => console.log('on change', value),
  onDragStart: value => console.log('on drag start', value),
  onDragEnd: value => console.log('on drag end', value),
  onDragMove: value => console.log('on drag move', value),
});

const trackThree = new ProgressBar('#track-three', {
  min: 5,
  initialValue: 5.5,
  max: 10,
  step: 0.1,
  arrowMoveStep: 0.1,
  pageMoveStep: 1,
  getTooltipText: (value, options) => {
    return value.toString();
  },
  onChange: value => console.log('on change', value),
  onDragStart: value => console.log('on drag start', value),
  onDragEnd: value => console.log('on drag end', value),
  onDragMove: value => console.log('on drag move', value),
});
