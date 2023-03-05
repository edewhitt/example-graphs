import { BaseBarGraph } from '../../shared';
import render, { MultiColumnBarGraphOptions } from './render';

export default class MultiVerticalBarGraph<T> extends BaseBarGraph<T, MultiColumnBarGraphOptions<T>> {
  public render(isResize = false): void {
    render(this.parentId, this.data, this.options, isResize);
  }
}
