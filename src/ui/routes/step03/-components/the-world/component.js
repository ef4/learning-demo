import Component from '@ember/component';
import { task, race } from 'ember-concurrency';
import { waitForEvent } from 'living-animation/src/-utils/concurrency';
import { computed } from '@ember/object';

export default Component.extend({
  init() {
    this._super();
    this.set('aliveDots', []);
  },

  dots: computed('aliveDots', 'newDot', function() {
    return this.aliveDots.concat([this.newDot]);
  }),

  pickSize: task(function * (startEvent) {
    let startLocation = this.whereInTheWorld(startEvent);
    this.set('newDot', {
      x: startLocation.x,
      y: startLocation.y,
      r: 0,
      hue: 0
    });
    while (true) {
      let event = yield race([
        waitForEvent(window, 'mousemove'),
        waitForEvent(window, 'mouseup')
      ]);
      let location = this.whereInTheWorld(event);
      let dx = location.x - startLocation.x;
      let dy = location.y - startLocation.y;
      let r = Math.round(Math.sqrt(dx*dx + dy*dy));
      // BEGIN-SNIPPET pick-size-hue
      this.set('newDot', {
        x: this.newDot.x,
        y: this.newDot.y,
        r,
        hue: (r + 180) % 360
      });
      // END-SNIPPET
      if (event.type === 'mouseup') {
        break;
      }
    }
    this.set('aliveDots', this.aliveDots.concat([this.newDot]));
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
