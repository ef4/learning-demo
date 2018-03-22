import Controller from '@ember/controller';

function massOf(dot) {
  return 100 * Math.pow(dot.r, 3);
}
export default Controller.extend({
  applyPhysics(dots, timeStep) {
    return dots.map(dot => {
      let accelerations = dots.filter(d => d !== dot).map(otherDot => {
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
        let force = 0.0000001*massOf(otherDot)*massOf(dot)/distanceSquared;
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
    }).filter(Boolean);
  }
});
