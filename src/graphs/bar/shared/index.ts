import type { ScaleBand, ScaleLinear } from 'd3';
import type { BaseType, Selection } from 'd3-selection';
import { selectSVG } from './helpers';

export type BarGraph<T> = {
  chart: Selection<BaseType | SVGGElement, T, SVGElement, unknown>;
  labelScale: ScaleBand<string>;
  valueScale: ScaleLinear<number, number>;
};

export type BarGraphOptions<T> = {
  getLabel(input: T): string;
  getValue(input: T): number;
  gradient?: [string, string];
  margins?: Margins;
};

export type Margins = { top: number; right: number; left: number; bottom: number };

export abstract class BaseBarGraph<T, R = BarGraphOptions<T>> {
  protected readonly parentId: string;
  protected readonly options: R;

  protected data: Array<T>;
  protected height: number = 0;
  protected width: number = 0;

  constructor(parentId: string, data: Array<T> | undefined, options: R) {
    this.parentId = parentId;
    this.data = data ?? new Array<T>();
    this.options = options;

    const selected = selectSVG(parentId);
    if (!selected) return;

    const bounds = selected[1];
    this.width = bounds.width;
    this.height = bounds.height;
  }

  abstract render(isResize?: boolean): void;

  public resize(): void {
    const selected = selectSVG(this.parentId);
    if (!selected) return;

    const bounds = selected[1];
    if (this.width === bounds.width && this.height === bounds.height) return;

    this.width = bounds.width;
    this.height = bounds.height;

    this.render(true);
  }

  public update(data: Array<T>): void {
    this.data = data;
    this.render();
  }
}
