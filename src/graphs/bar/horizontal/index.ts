import { BaseBarGraph } from '../shared';
import render from './render';

export default class HorizontalBarGraph<T> extends BaseBarGraph<T> {
  public render(isResize: boolean = false): void {
    render(this.parentId, this.data, this.options, isResize);
  }
}
