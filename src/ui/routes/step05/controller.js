import Controller from '@ember/controller';

export default Controller.extend({
  applyPhysics(dots, timeStep) {
    return dots.map(dot => {
      let {x,y,vx,vy,r,hue} = dot;
      // BEGIN-SNIPPET gravity
      let ax = 0;
      let ay = 0.001;
      // END-SNIPPET
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

});
