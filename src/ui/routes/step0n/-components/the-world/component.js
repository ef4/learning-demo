import Component from '@ember/component';
import { task, race } from 'ember-concurrency';
import { rAF, waitForEvent } from 'living-animation/src/-utils/concurrency';
import { clock } from 'ember-animated';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  run: task(function * () {
    this.aliveDots = [];
    let lastTick = clock.now();
    while (true) {
      let now = clock.now();
      let timeStep = now - lastTick;
      lastTick = now;
      this.set('aliveDots', this.applyPhysics(this.aliveDots, timeStep));
      yield rAF();
    }
  }).on('init'),

  dots: computed('aliveDots', 'newDot', function() {
    return this.aliveDots.concat([this.newDot]);
  }),

  createDot: task(function * (startEvent) {
    if (startEvent.target.classList.contains('new-dot')) {
      yield this.setInMotion.perform(startEvent);
    } else {
      yield this.pickSize.perform(startEvent);
    }
  }),

  pickSize: task(function * (startEvent) {
    let startLocation = this.whereInTheWorld(startEvent);
    this.set('newDot', {
      x: startLocation.x,
      y: startLocation.y,
      vx: 1,
      vy: 0,
      r: 0,
      hue: 0,
      class: 'new-dot'
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
      this.set('newDot', {
        x: this.newDot.x,
        y: this.newDot.y,
        vx: this.newDot.vx,
        vy: this.newDot.vy,
        r,
        hue: ( r + 180 ) % 360,
        class: this.newDot.class
      });
      if (event.type === 'mouseup') {
        break;
      }
    }
  }),

  setInMotion: task(function * (startEvent) {
    let startLocation = this.whereInTheWorld(startEvent);
    let pinnedX = this.newDot.x;
    let pinnedY = this.newDot.y;
    while (true) {
      let event = yield race([
        waitForEvent(window, 'mousemove'),
        waitForEvent(window, 'mouseup')
      ]);
      let location = this.whereInTheWorld(event);
      let diffX = location.x - startLocation.x;
      let diffY = location.y - startLocation.y;
      let vx = diffX / -100;
      let vy = diffY / -100;
      this.set('newDot', {
        x: pinnedX + diffX,
        y: pinnedY + diffY,
        vx,
        vy,
        r: this.newDot.r,
        hue: this.newDot.hue,
        class: this.newDot.class
      });
      if (event.type === 'mouseup') {
        break;
      }
    }
    this.set('aliveDots', this.aliveDots.concat(Object.assign({}, this.newDot, {
      class: null
    })));
    this.set('newDot', null);
  }),

  whereInTheWorld(event) {
    let svg = this.element.querySelector('svg');
    let point = svg.createSVGPoint();
    point.x = event.x;
    point.y = event.y;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  },

  // The following is just a way to tell ember-animated that we are
  // busy animating things. That only matters here because we're using
  // ember-animated's `clock`, and the clock is only guaranteed
  // consistent while animations are running. (In between animations,
  // it can do things like adjust the clock to catch up to real time.)
  motionService: service('-ea-motion'),
  isAnimating: true,
  didInsertElement() {
    this.get('motionService').register(this);
  },
  willDestroyElement() {
    this.get('motionService').unregister(this);
  },
  beginStaticMeasurement() {},
  endStaticMeasurement() {}

});
