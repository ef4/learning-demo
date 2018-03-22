import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  init() {
    this._super();
    this.set('dots', []);
  },

  createDot: task(function * (startEvent) {
    let startLocation = this.whereInTheWorld(startEvent);
    let newDot = {
      x: startLocation.x,
      y: startLocation.y
    };
    this.set('dots', this.dots.concat([newDot]));

  }),

  whereInTheWorld(event) {
    let svg = this.element.querySelector('svg');
    let point = svg.createSVGPoint();
    point.x = event.x;
    point.y = event.y;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

});
