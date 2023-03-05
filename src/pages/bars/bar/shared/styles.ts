import type { ScaleBand, Selection } from 'd3';
import { easeCubicOut } from 'd3';

export const BAR_STYLES = {
  BORDER_RADIUS: 8,
  DELAY_FACTOR: 50,
  MAX_BAND_WIDTH: 45,
};

const AXIS_TRANSITION_DURATION = 100;
const DEFAULT_GRADIENT = ['#F2C66B', '#D13D73'];

export type Margins = { top: number; right: number; left: number; bottom: number };

export type SVGSelection = Selection<SVGElement, unknown, null, unknown>;

export const getBandwidth = (scale: ScaleBand<any>) => {
  return Math.min(scale.bandwidth(), BAR_STYLES.MAX_BAND_WIDTH);
};

export const buildAxisTransitionInFn = (isResize: boolean) => {
  return (axis: Selection<any, unknown, any, unknown>): void => {
    axis
      .transition()
      .duration(isResize ? 0 : AXIS_TRANSITION_DURATION)
      .ease(easeCubicOut)
      .attr('opacity', 1);
  };
};

export const buildAxisTransitionOutFn = (isResize: boolean) => {
  return (axis: Selection<any, unknown, any, unknown>): void => {
    axis
      .transition()
      .duration(isResize ? 0 : AXIS_TRANSITION_DURATION)
      .ease(easeCubicOut)
      .attr('opacity', 0)
      .remove();
  };
};

export const createGradient = (
  parentId: string,
  svg: SVGSelection,
  inputGradient: [string, string] | undefined,
  isVertical = true
) => {
  svg.selectAll('defs').remove();
  const defs = svg.append('defs');

  const gradient = inputGradient || DEFAULT_GRADIENT;

  const bgGradient = defs
    .append('linearGradient')
    .attr('id', parentId + '-bar-gradient')
    .attr('gradientTransform', `rotate(${isVertical ? 90 : 0})`);

  bgGradient
    .append('stop')
    .attr('stop-color', gradient[isVertical ? 0 : 1])
    .attr('offset', '0%');

  bgGradient
    .append('stop')
    .attr('stop-color', gradient[isVertical ? 1 : 0])
    .attr('offset', '100%');
};

type SVGRect<T> = Selection<SVGRectElement, T, SVGElement, unknown>;
export const styleBackgroundBar = <T>(rect: SVGRect<T>): SVGRect<T> => {
  return rect
    .attr('class', 'bar-shadow')
    .attr('fill', '#eeefef')
    .attr('rx', BAR_STYLES.BORDER_RADIUS)
    .attr('ry', BAR_STYLES.BORDER_RADIUS);
};

export const styleBar = <T>(rect: SVGRect<T>): SVGRect<T> => {
  return rect.attr('class', 'bar').attr('rx', BAR_STYLES.BORDER_RADIUS).attr('ry', BAR_STYLES.BORDER_RADIUS);
};

export const styleAxis = (axis: Selection<SVGGElement, unknown, null, unknown>): void => {
  axis.attr('opacity', 0);

  axis.selectAll('.domain').attr('stroke', '#DCDDDC').attr('stroke-width', 1.5);

  axis.selectAll('.tick line').attr('stroke', '#DCDDDC').attr('stroke-width', 1.5);
};
