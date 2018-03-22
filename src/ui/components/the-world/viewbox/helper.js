import { helper } from '@ember/component/helper';

export function viewbox([width]) {
  return `${width/-2} ${width/-2} ${width} ${width}`;
}

export default helper(viewbox);
