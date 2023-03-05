import ScaleLinear from 'd3';
import { BarGraph, BarGraphOptions } from '../../shared';
import {
  BarState,
  ValueFn,
  buildGroupTranslationFn,
  createBarColumns,
  createBars,
  removeBarColumns,
  renderLabelAxisBottom,
  renderValueAxisLeft,
  selectBarColumns,
  updateBarColumns,
} from '../../shared/bars';
import { BarColumnLayout, SVGSelection, composeLayout, selectSVG } from '../../shared/helpers';
import { bindMouseEvents } from '../../shared/mouse';
import {
  ScaleBandBySizeResult,
  ScaleBandResult,
  buildScaleBand,
  buildScaleBandBySize,
  buildScaleLinear,
} from '../../shared/scales';
import { createGradient, getBandwidth } from '../../shared/styles';

export type BarGraphColumn<T> = { getLabel: ValueFn<T, string>; getValue: ValueFn<T, number>; fill: string };
export type MultiColumnBarGraphOptions<T> = Omit<BarGraphOptions<T>, 'getValue'> & { bars: BarGraphColumn<T>[] };

const render = <T>(
  parentId: string,
  data: Array<T> | undefined,
  options: MultiColumnBarGraphOptions<T>,
  isResize: boolean
): BarGraph<T> | undefined => {
  if (!data?.length) return;

  const selected = selectSVG(parentId);
  if (!selected) return;

  const [svg, bounds] = selected;

  createGradient(parentId, svg, options.gradient, false);

  const layout = composeLayout(bounds, options.margins);

  const labelScale = buildScaleBand(data, options.getLabel, { range: [0, layout.width] });
  const columnsScale = buildScaleBandBySize<T>(
    options.bars.length,
    (record, index) => options.bars[index].getValue(record).toString(),
    { range: [0, labelScale.scale.bandwidth()], padding: 0.05 }
  );

  const allValues = data.flatMap((record) => options.bars.map((bar) => bar.getValue(record)));
  const valueScale = buildScaleLinear(allValues, { range: [layout.height, 0] });

  renderLabelAxisBottom(svg, labelScale.scale, layout, isResize);
  renderValueAxisLeft(svg, valueScale, layout, isResize);

  renderBars({
    data,
    parentId,
    layout,
    options,
    scales: {
      label: labelScale,
      columns: columnsScale,
      values: valueScale,
    },
    svg,
  });
};

export default render;

type RenderBarsInput<T> = {
  data: Array<T>;
  parentId: string;
  layout: BarColumnLayout;
  options: MultiColumnBarGraphOptions<T>;
  scales: {
    label: ScaleBandResult<T>;
    columns: ScaleBandBySizeResult<T>;
    values: ScaleLinear.ScaleLinear<number, number>;
  };
  svg: SVGSelection;
};

type SubColumn = {
  fill: string;
  index: number;
  label: string;
  tooltip: string;
  value: number;
  xOffset: number;
};

export const renderBars = <T>(input: RenderBarsInput<T>): void => {
  const columnWidth = getBandwidth(input.scales.columns.scale);

  const allColumns: SubColumn[] = input.data.flatMap((record) => {
    return input.options.bars.map((bar, index) => ({
      index,
      fill: bar.fill,
      label: bar.getLabel(record),
      tooltip: `${bar.getLabel(record)}: ${bar.getValue(record)}`,
      value: bar.getValue(record),
      xOffset: input.layout.margins.left + input.scales.label.toScaled(record),
    }));
  });

  const groupTranslationFn = buildGroupTranslationFn(
    (record: SubColumn) => record.xOffset + (input.scales.columns.scale(record.index.toString()) ?? 0),
    input.layout.margins.top
  );

  const [initState, finalState, initBackgroundState, finalBackgroundState] = buildBarStates(
    columnWidth,
    input.layout,
    input.scales.values
  );

  const groups = selectBarColumns(input.svg, allColumns);

  // remove old groups
  removeBarColumns(groups);

  // update remaining groups;
  updateBarColumns(groups, groupTranslationFn, finalState, finalBackgroundState);

  const existingGroupsSize = groups.size();

  // new groups
  const newGroups = createBarColumns(groups, groupTranslationFn);

  createBars(newGroups, initState, initBackgroundState);

  updateBarColumns(newGroups, groupTranslationFn, finalState, finalBackgroundState, existingGroupsSize);

  bindMouseEvents(input.svg, newGroups, (record) => record.tooltip);
};

const buildBarStates = (
  columnWidth: number,
  layout: BarColumnLayout,
  scale: ScaleLinear.ScaleLinear<number, number>
) => {
  const initBackgroundState: Partial<BarState<SubColumn>> = {
    height: 0,
    width: columnWidth,
    y: scale(0),
  };

  const initState: Partial<BarState<SubColumn>> = {
    ...initBackgroundState,
    fill: (record) => record.fill,
  };

  const finalBackgroundState: Partial<BarState<SubColumn>> = {
    ...initBackgroundState,
    height: layout.height,
    width: columnWidth,
    y: 0,
  };

  const finalState: Partial<BarState<SubColumn>> = {
    ...initState,
    height: (record) => layout.height - (scale(record.value) ?? 0),
    y: (record) => scale(record.value) ?? 0,
  };

  return [initState, finalState, initBackgroundState, finalBackgroundState];
};
