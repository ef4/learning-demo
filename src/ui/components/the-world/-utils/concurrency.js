export function rAF() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

export function waitForEvent(object, eventName) {
  return new Promise(resolve => {
    function handler(event) {
      object.removeEventListener(eventName, handler);
      resolve(event);
    }
    object.addEventListener(eventName, handler);
  });
}
