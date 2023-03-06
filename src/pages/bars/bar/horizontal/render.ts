import { BarGraph, BarGraphOptions } from '../shared';
import {
  BarState,
  ValueFn,
  buildGroupTranslationFn,
  createBarColumns,
  createBars,
  removeBarColumns,
  renderLabelAxisLeft,
  renderValueAxisBottom,
  selectBarColumns,
  updateBarColumns,
} from '../shared/bars';
import { BarColumnLayout, SVGSelection, composeLayout, selectSVG } from '../shared/helpers';
import { bindMouseEvents } from '../shared/mouse';
import { ScaleBandResult, ScaleLinearFromDataResult, buildScaleBand, buildScaleLinearFromData } from '../shared/scales';
import { createGradient, getBandwidth } from '../shared/styles';

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

  createGradient(parentId, svg, options.gradient, false);

  const layout = composeLayout(bounds, options.margins);

  const labelScale = buildScaleBand(data, options.getLabel, { range: [0, layout.height] });
  const valueScale = buildScaleLinearFromData(data, options.getValue, { range: [0, layout.width] });

  renderLabelAxisLeft(svg, labelScale.scale, layout, isResize);
  renderValueAxisBottom(svg, valueScale.scale, layout, isResize);

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

export const renderBars = <T>(input: RenderBarsInput<T>): void => {
  const bandWidth = getBandwidth(input.scales.label.scale);
  const [initState, finalState, initBackgroundState, finalBackgroundState] = buildBarStates(
    input.parentId,
    bandWidth,
    input.layout,
    input.scales.value.toScaled
  );

  const groupTranslationFn = buildGroupTranslationFn(
    input.layout.margins.left + input.layout.interAxisPadding * 2,
    (record: T) =>
      input.layout.margins.top +
      input.scales.label.toScaled(record) +
      (input.scales.label.scale.bandwidth() - bandWidth) / 2
  );

  const groups = selectBarColumns(input.svg, input.data);

  // remove exiting groups
  removeBarColumns(groups);

  // update remaining groups;
  updateBarColumns(groups, groupTranslationFn, finalState, finalBackgroundState);

  // create new and update new groups
  const newGroups = createBarColumns(groups, groupTranslationFn);

  createBars(newGroups, initState, initBackgroundState);

  updateBarColumns(newGroups, groupTranslationFn, finalState, finalBackgroundState, groups.size());

  bindMouseEvents(
    input.svg,
    newGroups,
    (record) => `${input.options.getLabel(record)}: ${input.options.getValue(record)}`
  );
};

const buildBarStates = <T>(
  parentId: string,
  bandWidth: number,
  layout: BarColumnLayout,
  valueFn: ValueFn<T | number, number>
) => {
  const initBackgroundState: Partial<BarState<T>> = { height: bandWidth, width: 0, x: 0 };
  const initState: Partial<BarState<T>> = {
    ...initBackgroundState,
    fill: `url(#${parentId}-bar-gradient)`,
    y: valueFn(0),
  };

  const finalBackgroundState: Partial<BarState<T>> = {
    ...initBackgroundState,
    width: layout.width - layout.interAxisPadding,
  };
  const finalState: Partial<BarState<T>> = { ...initState, width: valueFn };

  return [initState, finalState, initBackgroundState, finalBackgroundState];
};
