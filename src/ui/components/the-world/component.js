import Component from '@ember/component';
import { task } from 'ember-concurrency';

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
      yield new Promise(resolve => requestAnimationFrame(resolve));
    }
  }).on('init'),

  newDot(event) {
    let location = this.whereInTheWorld(event);
    this.set('dots', this.dots.concat([
      { x: location.x, y: location.y, r: 20 }
    ]));
  },

  whereInTheWorld(event) {
    let svg = this.element.querySelector('svg');
    let point = svg.createSVGPoint();
    point.x = event.x;
    point.y = event.y;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

});
