import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3';
import { ValueFn } from './bars';

export type ValueScale = ScaleLinear<number, number>;

export type ScaleOptions = {
  padding: number;
  range: [number, number];
};

export const DEFAULT_SCALE_OPTIONS: ScaleOptions = {
  padding: 0.2,
  range: [0, 100],
};

export type ScaleBandResult<T> = {
  scale: ScaleBand<string>;
  toScaled: (record: T) => number;
};

export const buildScaleBand = <T>(
  data: Array<T>,
  domainFn: (_: T) => string,
  inputOptions: Partial<ScaleOptions>
): ScaleBandResult<T> => {
  const domain = data.map(domainFn);
  const options: ScaleOptions = { ...DEFAULT_SCALE_OPTIONS, ...inputOptions };

  const scale = scaleBand()
    .domain(domain)
    .range(options.range)
    .padding(options.padding);

  return { scale, toScaled: (record: T) => scale(domainFn(record)) ?? 0 };
};

export type ScaleBandBySizeResult<T> = {
  scale: ScaleBand<string>;
  toScaled: (record: T, index: number) => number;
};

export const buildScaleBandBySize = <T>(
  size: number,
  domainFn: (_: T, index: number) => string,
  inputOptions: Partial<ScaleOptions>
): ScaleBandBySizeResult<T> => {
  const domain: string[] = [];
  for (let i = 0; i < size; i++) domain.push(i.toString());

  const options: ScaleOptions = { ...DEFAULT_SCALE_OPTIONS, ...inputOptions };

  const scale = scaleBand()
    .domain(domain)
    .range(options.range)
    .padding(options.padding);

  return { scale, toScaled: (record: T, index: number) => scale(domainFn(record, index)) ?? 0 };
};

export const buildScaleLinear = (
  domain: Array<number>,
  inputOptions: Partial<ScaleOptions>
): ScaleLinear<number, number> => {
  const options: ScaleOptions = { ...DEFAULT_SCALE_OPTIONS, ...inputOptions };

  const scale = scaleLinear()
    .domain([0, Math.max(...domain) * 1.1])
    .range(options.range);

  scale.tickFormat(undefined, 'd');

  return scale;
};

export type ScaleLinearFromDataResult<T> = {
  scale: ScaleLinear<number, number>;
  toScaled: (record: T | number) => number;
};

export const buildScaleLinearFromData = <T>(
  data: Array<T>,
  domainFn: ValueFn<T, number>,
  inputOptions: Partial<ScaleOptions>
): ScaleLinearFromDataResult<T> => {
  const domain = data.map(domainFn);
  const options: ScaleOptions = { ...DEFAULT_SCALE_OPTIONS, ...inputOptions };

  const scale = scaleLinear()
    .domain([0, Math.max(...domain) * 1.1])
    .range(options.range);

  scale.tickFormat(undefined, 'd');

  const toScaled = (record: T | number): number => {
    if (Number.isFinite(record)) return scale(record as number) ?? 0;
    return scale(domainFn(record as T)) ?? 0;
  };

  return { scale, toScaled };
};

export const buildScaleLinearSized = (
  size: number,
  inputOptions: Partial<ScaleOptions>
): [ScaleLinear<number, number>, (index: number) => number] => {
  const options: ScaleOptions = { ...DEFAULT_SCALE_OPTIONS, ...inputOptions };

  const scale = scaleLinear()
    .domain([0, size - 1])
    .range(options.range);

  return [scale, (index: number): number => scale(index) ?? 0];
};
