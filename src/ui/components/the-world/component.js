import Component from '@ember/component';
import { task, race } from 'ember-concurrency';
import { rAF, waitForEvent } from './-utils/concurrency';
import { clock } from 'ember-animated';
import { inject as service } from '@ember/service';

function massOf(dot) {
  return Math.pow(dot.r, 3);
}

export default Component.extend({
  run: task(function * () {
    this.dots = [];
    let lastTick = clock.now();
    while (true) {
      let now = clock.now();
      let timeStep = now - lastTick;
      lastTick = now;


      this.set('dots', this.dots.map(dot => {
        let accelerations = this.dots.filter(d => d !== dot).map(otherDot => {
          let dx = otherDot.x - dot.x;
          let dy = otherDot.y - dot.y;
          let distanceSquared = dx*dx + dy*dy;
          let distance = Math.sqrt(dx*dx + dy*dy);
          if (distance < otherDot.r + dot.r) {
            if (dot.r < otherDot.r) {
              return null;
            } else {
              return { ax: 0, ay: 0 };
            }
          }
          let force = 0.00001*massOf(otherDot)*massOf(dot)/distanceSquared;
          let fx = force * dx / distance;
          let fy = force * dy / distance;
          let ax = fx / massOf(dot);
          let ay = fy / massOf(dot);
          return { ax, ay };
        });

        if (accelerations.any(a => !a)) {
          return null;
        }

        let { ax, ay } = accelerations.reduce(({ax: accumX, ay: accumY}, { ax, ay }) => {
          return {
            ax: accumX + ax,
            ay: accumY + ay
          };
        }, { ax: 0, ay: 0 });

        let {x,y,vx,vy,r,hue} = dot;

        return {
          x: x + vx*timeStep,
          y: y + vy*timeStep,
          vx: vx + ax*timeStep,
          vy: vy + ay*timeStep,
          r,
          hue
        };
      }).filter(Boolean));
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
    let startLocation = this.whereInTheWorld(startEvent);
    this.set('newDot', {
      x: startLocation.x,
      y: startLocation.y,
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
        hue: r % 360
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
        hue: this.newDot.hue
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
