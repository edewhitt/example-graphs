import { Axis, BaseType, NumberValue, ScaleBand, ScaleLinear, Selection, Transition, axisBottom, axisLeft, easeCubicOut } from 'd3';
import { SVGSelection, Translation, BarColumnLayout } from './helpers';
import { buildAxisTransitionOutFn, styleAxis, buildAxisTransitionInFn, styleBackgroundBar, styleBar, BAR_STYLES } from './styles';
import { formatTextForElements } from './text';

export const createBarColumns = <T>(
  selection: Selection<BaseType, T, SVGElement, unknown>,
  translation: (record: T) => string
): Selection<SVGGElement, T, SVGElement, unknown> => {
  return selection
    .enter()
    .append('g')
    .attr('class', 'bar-column')
    .attr('transform', translation);
};

export type BarState<T> = {
  fill: string | ValueFn<T, string>;
  height: number | ValueFn<T, number>;
  width: number | ValueFn<T, number>;
  x: number | ValueFn<T, number>;
  y: number | ValueFn<T, number>;
};

export const createBars = <T>(
  selection: Selection<SVGGElement, T, SVGElement, unknown>,
  state: Partial<BarState<T>>,
  backgroundState: Partial<BarState<T>>
) => {
  createBarsRects(selection, backgroundState).call(styleBackgroundBar);
  createBarsRects(selection, state).call(styleBar);
};

export const createBarsRects = <T>(selection: Selection<SVGGElement, T, SVGElement, unknown>, state: Partial<BarState<T>>) => {
  const bars = selection.append('rect');
  applyBarState(bars, state);
  return bars;
};

export const removeBarColumns = <T>(selection: Selection<BaseType, T, SVGElement, unknown>): void => {
  selection.exit().remove();
};

export const selectBarColumns = <T>(svg: SVGSelection, data: Array<T>): Selection<BaseType, T, SVGElement, unknown> => {
  return svg.selectAll('g.bar-column').data(data);
};

export const updateBarColumns = <T>(
  selection: Selection<any, T, SVGElement, unknown>,
  translationFn: ValueFn<T, string>,
  state: Partial<BarState<T>>,
  backgroundState: Partial<BarState<T>>,
  existingColumnsSize: number = 0
) => {
  const additionalDelay = (existingColumnsSize > 0 ? existingColumnsSize - 1 : existingColumnsSize) * BAR_STYLES.DELAY_FACTOR;
  const transition = selection
    .transition()
    .duration(800)
    .ease(easeCubicOut)
    .delay((_, i) => i * BAR_STYLES.DELAY_FACTOR + additionalDelay)
    .attr('transform', translationFn);

  const barBackgrounds = transition.select('rect.bar-shadow');
  applyBarState(barBackgrounds, backgroundState);

  const bars = transition.select('rect.bar');
  applyBarState(bars, state);
};

export const buildGroupTranslationFn = <T>(
  xFn: number | ValueFn<T, number>,
  yFn: number | ValueFn<T, number>
): ValueFn<T, string>  => {
  return (record: T) =>
    new Translation(
      getValueFn(xFn).call(this, record),
      getValueFn(yFn).call(this, record),
    ).toString();
};

export type ValueFn<T, V> = (_: T) => V;

const getValueFn = <T, V>(input: V | ValueFn<T, V>) => {
  return Number.isFinite(input) ? (_: T) => (input as V) : (input as ValueFn<T, V>);
};

const applyBarState = <T>(
  selection: Selection<any, T, SVGElement, unknown> | Transition<any, T, SVGElement, unknown>,
  state: Partial<BarState<T>>
) => {
  Object.entries(state).forEach(([key, value]) => {
    if (value !== undefined) selection.attr(key, getValueFn(value));
  });
};

// Axis

/**
 * Renders the bottom label axis for a vertical-oriented bar graph.
 *
 * Handles the styls and animations for elements exiting and entering the dom.
 *
 * On resize, animations are removed.
 *
 * @method renderLabelAxisBottom
 */
export const renderLabelAxisBottom = (
  svg: SVGSelection,
  scale: ScaleBand<string>,
  layout: BarColumnLayout,
  isResize: boolean
): void => {
  svg.selectAll('g.label-axis').call(buildAxisTransitionOutFn(isResize));

  const translation = new Translation(
    layout.margins.left,
    layout.height + layout.margins.top + layout.interAxisPadding
  );

  const axis = svg
    .append('g')
    .attr('class', 'label-axis')
    .attr('transform', translation.toString())
    .attr('opacity', 0)
    .call(axisBottom(scale))
    .call(styleAxis);

  axis.call(buildAxisTransitionInFn(isResize));
  axis.selectAll('.tick text').call(formatTextForElements, scale.bandwidth());
};

export const renderLabelAxisLeft = (
  svg: SVGSelection,
  scale: ScaleBand<string>,
  layout: BarColumnLayout,
  isResize: boolean
): void => {
  svg.selectAll('g.label-axis').call(buildAxisTransitionOutFn(isResize));

  const translation = new Translation(layout.margins.left, layout.margins.top);

  const axis = svg
    .append('g')
    .attr('class', 'label-axis')
    .attr('transform', translation.toString())
    .attr('opacity', 0)
    .call(axisLeft(scale))
    .call(styleAxis);

  axis.call(buildAxisTransitionInFn(isResize));

  axis.selectAll('.domain').attr('transform', `translate(${layout.interAxisPadding}, 0)`);
  axis.selectAll('.tick line').attr('transform', `translate(${layout.interAxisPadding}, 0)`);
  axis.selectAll('.tick text').call(formatTextForElements, layout.margins.left, 1);
};

export const renderValueAxisBottom = (
  svg: SVGSelection,
  scale: ScaleLinear<number, number>,
  layout: BarColumnLayout,
  isResize: boolean
): void => {
  svg.selectAll('g.value-axis').call(buildAxisTransitionOutFn(isResize));

  const translation = new Translation(
    layout.margins.left + layout.interAxisPadding * 2,
    layout.height + layout.margins.top + layout.interAxisPadding
  );

  svg
    .append('g')
    .attr('class', 'value-axis')
    .attr('transform', translation.toString())
    .call(formatValueAxis(axisBottom(scale)))
    .call(styleAxis)
    .call(buildAxisTransitionInFn(isResize));
};

/**
 * Renders the left value axis for a vertical-oriented bar graph.
 *
 * Handles the styles and animations for elements exiting and entering the dom.
 *
 * On resize, animations are removed.
 *
 * @method renderValueAxisLeft
 */
export const renderValueAxisLeft = (
  svg: SVGSelection,
  scale: ScaleLinear<number, number>,
  layout: BarColumnLayout,
  isResize: boolean
): void => {
  svg.selectAll('g.value-axis').call(buildAxisTransitionOutFn(isResize));

  const translation = new Translation(layout.margins.left, layout.margins.top);

  svg
    .append('g')
    .attr('class', 'value-axis')
    .attr('transform', translation.toString())
    .attr('opacity', 0)
    .call(formatValueAxis(axisLeft(scale)))
    .call(styleAxis)
    .call(buildAxisTransitionInFn(isResize));
};

const formatValueAxis = (axis: Axis<NumberValue>) => {
  return axis.tickFormat((value) => Number.isInteger(value) ? value.toString() : '');
};