/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Selection } from 'd3-selection';
import { event as currentEvent, select } from 'd3-selection';
import type { ValueFn } from './bars';
import type { SVGSelection } from './styles';

export const bindMouseEvents = <T>(
  svg: SVGSelection,
  selection: Selection<any, T, SVGElement, any>,
  tooltipDisplayFn: ValueFn<T, string>
) => {
  selection
    .on('mouseenter', (record: T) => onMouseEnter(currentEvent.target, svg, tooltipDisplayFn(record)))
    .on('mousemove', () => onMouseMove(currentEvent.pageX, currentEvent.pageY))
    .on('mouseleave', () => onMouseLeave(svg));
};

export const getTooltip = (): Selection<any, unknown, HTMLElement, any> => {
  const selectedTooltip = select('div.d3-tooltip');

  if (!selectedTooltip.empty()) return selectedTooltip;

  const tooltip = select('body').append('div').attr('class', 'd3-tooltip').style('visibility', 'hidden');

  tooltip.append('div');

  return tooltip;
};

export const onMouseMove = (x: number, y: number) => {
  getTooltip()
    .style('visibility', 'visible')
    .style('top', y + 'px')
    .style('left', x + 'px');
};

export const onMouseEnter = (target: any, svg: SVGSelection, text: string) => {
  select(target).classed('active', true).attr('opacity', 1);
  svg.selectAll('.bar-column:not(.active)').attr('opacity', 0.5);
  getTooltip().style('visibility', 'visible').select('div').html(text);
};

export const onMouseLeave = (svg: SVGSelection) => {
  svg.selectAll('.bar-column').classed('active', false).attr('opacity', 1);
  getTooltip().style('visibility', 'hidden');
};
