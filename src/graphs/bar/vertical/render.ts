import {
  BarColumnLayout,
  SVGSelection,
} from '../shared/helpers';
import {
  composeLayout,
  selectSVG,
} from '../shared/helpers';
import { bindMouseEvents } from '../shared/mouse';
import { BarState, ValueFn, buildGroupTranslationFn, createBarColumns, createBars, removeBarColumns, renderLabelAxisBottom, renderValueAxisLeft, selectBarColumns, updateBarColumns } from '../shared/bars';
import { ScaleBandResult, ScaleLinearFromDataResult, buildScaleBand, buildScaleLinearFromData } from '../shared/scales';
import { createGradient, getBandwidth } from '../shared/styles';
import { BarGraphOptions, BarGraph } from '../shared';

/**
 * Renders the the x-axis, y-axis, and stylized bars for a vertical-oriented bar graph.
 *
 * This method determines the layout, scales, and gradients from the specified element and options.
 *
 * @method render
 */

const render = <T>(
  parentId: string,
  data: Array<T> | undefined,
  options: BarGraphOptions<T>,
  isResize: boolean
): BarGraph<T> | undefined => {
  if (!data?.length) return;

  const selected = selectSVG(parentId);
  if (!selected) return;

  const [svg, bounds] = selected;

  createGradient(parentId, svg, options.gradient);

  const layout = composeLayout(bounds, options.margins);

  const labelScale = buildScaleBand(data, options.getLabel, { range: [0, layout.width] });
  const valueScale = buildScaleLinearFromData(data, options.getValue, { range: [layout.height, 0] });

  renderLabelAxisBottom(svg, labelScale.scale, layout, isResize);
  renderValueAxisLeft(svg, valueScale.scale, layout, isResize);

  renderBars({
    data,
    parentId,
    layout,
    options,
    scales: {
      label: labelScale,
      value: valueScale,
    },
    svg,
  });
};

export default render;

type RenderBarsInput<T> = {
  data: Array<T>;
  parentId: string;
  layout: BarColumnLayout;
  options: BarGraphOptions<T>;
  scales: {
    label: ScaleBandResult<T>;
    value: ScaleLinearFromDataResult<T>;
  };
  svg: SVGSelection;
};

/**
 * Renders the bars for a vertical-oriented bar graph.
 *
 * Handles adjusting all bar groups (containing the bar and background shadow) accounting for position in scale, max band width, and appropriate margins.
 *
 * Handles the styling and animations for elements exiting, updating, and entering the DOM.
 *
 * @method renderBars
 */
export const renderBars = <T>(input: RenderBarsInput<T>): void => {
  const bandWidth = getBandwidth(input.scales.label.scale);
  const [initState, finalState, initBackgroundState, finalBackgroundState] = buildBarStates(input.parentId, bandWidth, input.layout, input.scales.value.toScaled);

  const groups = selectBarColumns(input.svg, input.data);

  const groupTranslationFn = buildGroupTranslationFn(
    (record: T) => input.layout.margins.left + input.scales.label.toScaled(record) + (input.scales.label.scale.bandwidth() - bandWidth) / 2,
    input.layout.margins.top
  );

  // remove old groups
  removeBarColumns(groups);

  // update remaining groups;
  updateBarColumns(
    groups,
    groupTranslationFn,
    finalState,
    finalBackgroundState,
  );

  // create new groups
  const newGroups = createBarColumns(groups, groupTranslationFn);

  createBars(newGroups, initState, initBackgroundState);

  updateBarColumns(
    newGroups,
    groupTranslationFn,
    finalState,
    finalBackgroundState,
    groups.size()
  );

  bindMouseEvents(newGroups, (record) => `${input.options.getLabel(record)}: ${input.options.getValue(record)}`);
};

const buildBarStates = <T>(
  parentId: string,
  bandWidth: number,
  layout: BarColumnLayout,
  valueFn: ValueFn<T | number, number>
) => {
  const initBackgroundState: Partial<BarState<T>> = {
    height: 0,
    width: bandWidth,
    y: valueFn(0),
  };
  const initState: Partial<BarState<T>> = {
    ...initBackgroundState,
    fill: `url(#${parentId}-bar-gradient)`
  };

  const finalBackgroundState: Partial<BarState<T>> = {
    ...initBackgroundState,
    height: layout.height,
    width: bandWidth,
    y: 0,
  };
  const finalState: Partial<BarState<T>> = {
    ...initState,
    height: (record: T) => layout.height - valueFn(record),
    y: valueFn,
  };

  return [
    initState,
    finalState,
    initBackgroundState,
    finalBackgroundState,
  ];
};