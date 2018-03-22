import EmberRouter from '@ember/routing/router';
import config from "../config/environment";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('step01');
  this.route('step01-code');
  this.route('step01-code2');
  this.route('step01-code3');
  this.route('step02');
  this.route('step02-code');
  this.route('step03-code');
  this.route('step03');
  this.route('step04-code');
  this.route('step04');
  this.route('step05-code');
  this.route('step05');
  this.route('step06-code');
  this.route('step06');

  this.route('step0n');
});

export default Router;

export const slideTransitionDuration = 800;

export const transitions = [
];
