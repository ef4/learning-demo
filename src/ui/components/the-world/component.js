import Component from '@ember/component';
import { task, race } from 'ember-concurrency';
import { rAF, waitForEvent } from './-utils/concurrency';

// Our world will be this wide, within our own coordinate system
const WIDTH = 1000;

export default Component.extend({
  // This puts the 0,0 point at the center of the world
  viewBox: `${WIDTH/-2} ${WIDTH/-2} ${WIDTH} ${WIDTH}`,

  run: task(function * () {
    this.dots = [];
    while (true) {
      this.set('dots', this.dots.map(({x,y,r}) => ({
        x: x + 1,
        y,
        r
      })));
      yield rAF();
    }
  }).on('init'),

  makeNewDot(event) {
    this.pickSize.perform(event);
  },

  pickSize: task(function * (startEvent) {
    let startLocation = this.whereInTheWorld(startEvent);
    this.set('newDot', { x: startLocation.x, y: startLocation.y, r: 0 });
    while (true) {
      let event = yield race([
        waitForEvent(window, 'mousemove'),
        waitForEvent(window, 'mouseup')
      ]);
      let location = this.whereInTheWorld(event);
      let dx = location.x - startLocation.x;
      let dy = location.y - startLocation.y;
      this.set('newDot', {
        x: this.newDot.x,
        y: this.newDot.y,
        r: Math.round(Math.sqrt(dx*dx + dy*dy))
      });
      if (event.type === 'mouseup') {
        break;
      }
    }
    this.set('dots', this.dots.concat([this.newDot]));
    this.set('newDot', null);
  }),

  whereInTheWorld(event) {
    let svg = this.element.querySelector('svg');
    let point = svg.createSVGPoint();
    point.x = event.x;
    point.y = event.y;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
});
