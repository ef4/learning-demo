import Resolver from 'ember-resolver/resolvers/fallback';
import buildResolverConfig from 'ember-resolver/ember-config';
import config from '../config/environment';
import { merge } from '@ember/polyfills';

let moduleConfig = buildResolverConfig(config.modulePrefix);
merge(moduleConfig.types, {
  config: { definitiveCollection: 'main' },
});
moduleConfig.collections.main.types.push('config');

export default Resolver.extend({
  config: moduleConfig
});
