/*
  These don't implement cancellation. Mostly that doesn't matter for
  demo purposes here.
*/

export function rAF() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

// I'm not using the waitForEvent exported by ember-concurrency
// because it's not a real Promise, so it doesn't work with
// `race`. See https://github.com/machty/ember-concurrency/issues/181
export function waitForEvent(object, eventName) {
  return new Promise(resolve => {
    function handler(event) {
      object.removeEventListener(eventName, handler);
      resolve(event);
    }
    object.addEventListener(eventName, handler);
  });
}
