import Controller from '@ember/controller';

export default Controller.extend({
  // BEGIN-SNIPPET apply-physics
  applyPhysics(dots, timeStep) {
    return dots.map(dot => {
      let {x,y,vx,vy,r,hue} = dot;
      let ax = 0;
      let ay = 0;
      return {
        x: x + vx*timeStep,
        y: y + vy*timeStep,
        vx: vx + ax*timeStep,
        vy: vy + ay*timeStep,
        r,
        hue
      };
    });
  }
  // END-SNIPPET
});
