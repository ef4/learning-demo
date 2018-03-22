import { helper } from '@ember/component/helper';
import ENV from 'living-animation/config/environment';
const { rootURL } = ENV;

export function assetURL([path]) {
  return `${rootURL}${path.replace(/^\//, '')}`;
}

export default helper(assetURL);
