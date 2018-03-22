import Controller from '@ember/controller';

function massOf(dot) {
  return 100 * Math.pow(dot.r, 3);
}
export default Controller.extend({
  // BEGIN-SNIPPET n-body
  applyPhysics(dots, timeStep) {
    let outputDots = [];

    nextDot:
    for (let dot of dots) {

      // we're going to add up all the accelerations
      // applied to us by other dots
      let ax = 0;
      let ay = 0;

      for (let otherDot of dots) {
        if (otherDot === dot) {
          // we don't apply gravity to ourself
          continue;
        }

        let dx = otherDot.x - dot.x;
        let dy = otherDot.y - dot.y;
        let distanceSquared = dx*dx + dy*dy;
        let distance = Math.sqrt(dx*dx + dy*dy);

        // check for collision
        if (distance < otherDot.r + dot.r) {
          if (dot.r < otherDot.r) {
            // if we are the smaller dot, we cease to exist
            continue nextDot;
          } else {
            // if we are the larger dot, we don't allow the
            // (destroyed) smaller dot to affect us
            continue;
          }
        }

        let force = 0.0000001*massOf(otherDot)*massOf(dot)/distanceSquared;
        let fx = force * dx / distance;
        let fy = force * dy / distance;
        ax += fx / massOf(dot);
        ay += fy / massOf(dot);
      }

      let {x,y,vx,vy,r,hue} = dot;

      outputDots.push({
        x: x + vx*timeStep,
        y: y + vy*timeStep,
        vx: vx + ax*timeStep,
        vy: vy + ay*timeStep,
        r,
        hue
      });
    }
    return outputDots;
  }
  // END-SNIPPET
});
