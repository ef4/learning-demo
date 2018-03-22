import Component from '@ember/component';
import { task, race } from 'ember-concurrency';
import { rAF, waitForEvent } from './-utils/concurrency';

export default Component.extend({
  run: task(function * () {
    this.dots = [];
    while (true) {
      this.set('dots', this.dots.map(({x,y,vx,vy,r,hue}) => {
        return {
          x: x + vx,
          y: y + vy,
          vx,
          vy: vy + 1,
          r,
          hue
        };
      }));
      yield rAF();
    }
  }).on('init'),

  createDot: task(function * (startEvent) {
    if (startEvent.target.classList.contains('new-dot')) {
      yield this.setInMotion.perform(startEvent);
    } else {
      yield this.pickSize.perform(startEvent);
    }
  }),

  pickSize: task(function * (startEvent) {
    this.set('newDot', {
      x: startEvent.x,
      y: startEvent.y,
      vx: 1,
      vy: 0,
      r: 0,
      hue: 0,
    });
    while (true) {
      let event = yield race([
        waitForEvent(window, 'mousemove'),
        waitForEvent(window, 'mouseup')
      ]);
      let dx = event.x - startEvent.x;
      let dy = event.y - startEvent.y;
      let r = Math.round(Math.sqrt(dx*dx + dy*dy));
      this.set('newDot', {
        x: this.newDot.x,
        y: this.newDot.y,
        vx: this.newDot.vx,
        vy: this.newDot.vy,
        r,
        hue: r % 360
      });
      if (event.type === 'mouseup') {
        break;
      }
    }
  }),

  setInMotion: task(function * (startEvent) {
    let pinnedX = this.newDot.x;
    let pinnedY = this.newDot.y;
    while (true) {
      let event = yield race([
        waitForEvent(window, 'mousemove'),
        waitForEvent(window, 'mouseup')
      ]);
      let diffX = event.x - startEvent.x;
      let diffY = event.y - startEvent.y;
      let vx = diffX / -10;
      let vy = diffY / -10;
      this.set('newDot', {
        x: pinnedX + diffX,
        y: pinnedY + diffY,
        vx,
        vy,
        r: this.newDot.r,
        hue: this.newDot.hue
      });
      if (event.type === 'mouseup') {
        break;
      }
    }
    this.set('dots', this.dots.concat([this.newDot]));
    this.set('newDot', null);
  }),



});
