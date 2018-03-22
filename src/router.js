import EmberRouter from '@ember/routing/router';
import config from "../config/environment";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('step01');
  this.route('step02');
  this.route('step0n');
});

export default Router;

export const slideTransitionDuration = 800;

export const transitions = [
];
