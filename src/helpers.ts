export function getElementLeft(el) {
  let left = 0;
  let element = el;

  // Loop through the DOM tree
  // and add it's parent's offset to get page offset
  do {
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  return left;
}
