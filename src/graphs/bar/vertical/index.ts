import render from './render';
import { BaseBarGraph } from '../shared';

export default class VerticalBarGraph<T> extends BaseBarGraph<T> {
  public render(isResize = false): void {
    render(this.parentId, this.data, this.options, isResize);
  }
}
