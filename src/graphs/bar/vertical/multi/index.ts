import render, { MultiColumnBarGraphOptions } from './render';
import { BaseBarGraph } from '../../shared';

export default class MultiVerticalBarGraph<T> extends BaseBarGraph<T, MultiColumnBarGraphOptions<T>> {
  public render(isResize: boolean = false): void {
    render(this.parentId, this.data, this.options, isResize);
  }
}