import Component from '@ember/component';
import { task } from 'ember-concurrency';

// The world will be this wide in our own coordinate system.
const WIDTH = 1000;

export default Component.extend({
  // This puts the 0,0 point at the center of the world
  viewBox: `${WIDTH/-2} ${WIDTH/-2} ${WIDTH} ${WIDTH}`,

  init() {
    this._super();
    this.dots = [
      { x: 0, y: 0, r: 20 }
    ];
  },

  run: task(function * () {
    while (true) {
      this.set('dots', this.get('dots').map(({x,y,r}) => ({
        x: x + 1,
        y,
        r
      })));
      yield new Promise(resolve => requestAnimationFrame(resolve));
    }
  }).on('init')

});
