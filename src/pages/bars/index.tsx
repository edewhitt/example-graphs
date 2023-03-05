import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './bars.module.scss';
import HorizontalBarGraph from './bar/horizontal';
import VerticalBarGraph from './bar/vertical';
import { BarGraphOptions, BaseBarGraph } from './bar/shared/index';
import MultiVerticalBarGraph from './bar/vertical/multi';
import Card from 'shared/components/card';
import faker from 'faker';
import type { MultiColumnBarGraphOptions } from './bar/vertical/multi/render';

type BarGraphResult = {
  label: string;
  value: number;
};

type MultiColumnResult = {
  label: string;
  value1: number;
  value2: number;
};

const OPTIONS: BarGraphOptions<BarGraphResult> = {
  getLabel: (input) => input.label,
  getValue: (input) => input.value,
  gradient: ['#F2C66B', '#D13D73'],
};

const MULTI_COLUMN_OPTIONS: MultiColumnBarGraphOptions<MultiColumnResult> = {
  ...OPTIONS,
  getLabel: (input) => input.label,
  bars: [
    { fill: 'steelblue', getLabel: (input) => `${input.label} value 2`, getValue: (input) => input.value2 },
    { fill: '#000000', getLabel: (input) => `${input.label} value 1`, getValue: (input) => input.value1 },
  ],
};

const BarsPage: FC = () => {
  const [data, setData] = useState<BarGraphResult[]>([
    { label: 'Joel', value: 10 },
    { label: 'Ellie', value: 1 },
  ]);

  const [multiColumnData, setMultiColumnData] = useState<MultiColumnResult[]>([
    { label: faker.company.companyName(), value1: 3, value2: 1 },
    { label: faker.company.companyName(), value1: 5, value2: 2 },
    {
      label: faker.company.companyName(),
      value1: 5,
      value2: 2,
    },
  ]);

  const multiVertGraph = new MultiVerticalBarGraph<MultiColumnResult>(
    'multiContainer',
    multiColumnData,
    MULTI_COLUMN_OPTIONS
  );

  const vertGraph = new VerticalBarGraph<BarGraphResult>('vertContainer', data, OPTIONS);
  const horGraph = new HorizontalBarGraph<BarGraphResult>('horContainer', data, {
    ...OPTIONS,
    gradient: ['#75A0D9', '#BD6FE0'],
  });

  useEffect(() => {
    const allGraphs: { graph: BaseBarGraph<unknown, unknown>; handler: () => void }[] = [
      { graph: multiVertGraph, handler: multiVertGraph.resize.bind(multiVertGraph) },
      { graph: vertGraph, handler: vertGraph.resize.bind(vertGraph) },
      { graph: horGraph, handler: horGraph.resize.bind(horGraph) },
    ];

    allGraphs.forEach(({ handler }) => window.addEventListener('resize', handler));

    return () => {
      allGraphs.forEach(({ handler }) => window.removeEventListener('resize', handler));
    };
  }, []);

  useEffect(() => {
    vertGraph.update(data);
    horGraph.update(data);
  }, [data]);

  useEffect(() => multiVertGraph.update(multiColumnData), [multiColumnData]);

  const addData = () => {
    setMultiColumnData([
      ...multiColumnData,
      {
        label: faker.company.companyName(),
        value1: randomInteger(0, 20),
        value2: randomInteger(0, 20),
      },
    ]);

    setData([...data, { label: faker.company.companyName(), value: randomInteger(0, 20) }]);
  };

  const updateData = () => {
    setMultiColumnData(
      multiColumnData.map((record) => ({
        ...record,
        value1: randomInteger(0, 20, record.value1),
        value2: randomInteger(0, 20, record.value2),
      }))
    );

    setData(data.map((record) => ({ ...record, value: randomInteger(0, 20, record.value) })));
  };

  const removeData = () => {
    setMultiColumnData(multiColumnData.slice(randomInteger(0, multiColumnData.length), 1));
    setData(data.slice(randomInteger(0, data.length), 1));
  };

  return (
    <>
      <section className="mt-2 text-right">
        <a onClick={addData} href="#" className="btn btn-primary me-2">
          Add
        </a>
        <a onClick={updateData} href="#" className="btn btn-secondary me-2">
          Update
        </a>
        <a onClick={removeData} href="#" className="btn btn-danger">
          Remove
        </a>
      </section>
      <section>
        <div className="row">
          <div className="col">
            <Card title="Horizontal Bar Graph">
              <div className={styles.svgContainer} id="horContainer"></div>
            </Card>
          </div>
          <div className="col">
            <Card title="Vertical Bar Graph">
              <div className={styles.svgContainer} id="vertContainer"></div>
            </Card>
          </div>
        </div>
      </section>
      <section>
        <Card title="Multicolumn Vertical Bar Graph">
          <div className={styles.svgContainer} id="multiContainer"></div>
        </Card>
      </section>
    </>
  );
};

function randomInteger(min: number, max: number, exclude?: number) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (exclude === undefined || value !== exclude) return value;
  }
}

export default BarsPage;
