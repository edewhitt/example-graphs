/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseType, Selection } from 'd3';
import { select } from 'd3-selection';
import { Margins } from '.';

// types and classes
export type SVGSelection = Selection<SVGElement, unknown, null, unknown>;

export class Translation {
  private readonly x: number;
  private readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public toString(): string {
    return `translate(${this.x},${this.y})`;
  }
}

const DEFAULT_AXIS_PADDING = 20;

const DEFAULT_MARGINS: Margins = { top: 50, right: 50, bottom: 50, left: 50 };

// layout

export interface BarColumnLayout {
  height: number;
  width: number;
  margins: Margins;
  interAxisPadding: number;
}

export const composeLayout = (
  rect: DOMRect,
  inputMargins: Margins | undefined,
  interAxisPadding: number = DEFAULT_AXIS_PADDING
): BarColumnLayout => {
  const margins = inputMargins ?? DEFAULT_MARGINS;

  return {
    height: rect.height - margins.bottom - margins.top - interAxisPadding,
    width: rect.width - margins.left - margins.right,
    margins: margins,
    interAxisPadding,
  };
};

// select

export const selectSVG = (parentId: string): [SVGSelection, DOMRect] | undefined => {
  const parent = select(`#${parentId}`);
  if (parent.empty()) return;

  let svg = parent.select('svg') as unknown as SVGSelection;
  if (svg.empty()) {
    svg = parent.append('svg') as unknown as SVGSelection;
  }

  const bounds = svg.node()?.getBoundingClientRect();

  if (svg && bounds) return [svg, bounds];
};
