import { FC, useEffect, useRef } from 'react';
import styles from './graphs.module.scss';
import HorizontalBarGraph from './bar/horizontal';
import VerticalBarGraph from './bar/vertical';
import { BarGraphOptions, BaseBarGraph } from './bar/shared/index';
import MultiVerticalBarGraph from './bar/vertical/multi';

type OpenAndPastDueResult = {
  degreeOfLateness: string;
  lateOrderCount: number;
};

type OpenClosedResult = {
  name: string;
  numOpened: number;
  numClosed: number;
};

const OPTIONS: BarGraphOptions<OpenAndPastDueResult> = {
  getLabel: (input) => input.degreeOfLateness,
  getValue: (input) => input.lateOrderCount,
  gradient: ["#F2C66B", "#D13D73"]
};

const BarGraphComponent: FC = () => {
  const multiBarData: OpenClosedResult[] = [
    { name: 'Ellie Jelly Bo Belly kelly smelly luelly for really', numOpened: 3, numClosed: 1 },
    { name: 'Joel Tole Sole soul pole role coal stole mole cajole', numOpened: 5, numClosed: 2 },
    { name: 'dsaojsfnlfsanasflkmfaslknaflknflkfasnlkfanlkafsnafslknfaslkfsan flaskn falkafs nlaskfn', numOpened: 5, numClosed: 2 },
  ];

  const multiVertGraph = new MultiVerticalBarGraph<OpenClosedResult>('multiContainer', multiBarData, {
    ...OPTIONS,
    getLabel: (input) => input.name,
    bars: [
      { fill: 'steelblue', getLabel: (input) => `${input.name} closed`, getValue: (input) => input.numClosed },
      { fill: '#000000', getLabel: (input) => `${input.name} opened`, getValue: (input) => input.numOpened },
    ],
  });

  const data: OpenAndPastDueResult[] = [
    { degreeOfLateness: '4+ weeks', lateOrderCount: 10 },
    { degreeOfLateness: '1 week', lateOrderCount: 1 }
  ];

  const vertGraph = new VerticalBarGraph<OpenAndPastDueResult>('vertContainer', data, OPTIONS);
  const horGraph = new HorizontalBarGraph<OpenAndPastDueResult>('horContainer', data, { ...OPTIONS, gradient: ['#75A0D9', '#BD6FE0'] });

  const allGraphs: { graph: BaseBarGraph<unknown, unknown>, handler: () => void }[] = [
    { graph: multiVertGraph, handler: multiVertGraph.resize.bind(multiVertGraph) },
    { graph: vertGraph, handler: vertGraph.resize.bind(vertGraph) },
    { graph: horGraph, handler: horGraph.resize.bind(horGraph) },
  ];

  const i = useRef<number>(0);

  useEffect(() => {
    allGraphs.forEach(({ graph }) => graph.render());

    allGraphs.forEach(({ handler }) => window.addEventListener('resize', handler));

    return () => {
      allGraphs.forEach(({ handler }) => window.removeEventListener('resize', handler));
    };
  });

  const addData = () => {
    i.current += 1;

    for (var index = 0; index < 1; index++) {
      multiBarData.push({ name: 'value: ' + i.current + index, numOpened: randomInteger(0, 20), numClosed: randomInteger(0, 20) });
    }

    multiVertGraph.update(multiBarData);

    data.push({ degreeOfLateness: 'value: ' + i.current, lateOrderCount: randomInteger(0, 20) });
    vertGraph.update(data);
    horGraph.update(data);
  };

  const updateData = () => {
    multiBarData.forEach(record => { record.numOpened = randomInteger(0, 20, record.numOpened); record.numClosed = randomInteger(0, 20, record.numClosed) });
    multiVertGraph.update(multiBarData);

    data.forEach(record => record.lateOrderCount = randomInteger(0, 20, record.lateOrderCount));
    vertGraph.update(data);
    horGraph.update(data);
  };


  const removeData = () => {
    multiBarData.splice(randomInteger(0, multiBarData.length), 1);
    multiVertGraph.update(multiBarData);

    data.splice(randomInteger(0, data.length), 1);
    vertGraph.update(data);
    horGraph.update(data);
  };

  return (
    <>
      <div className="mb-2 mt-5">
        <a onClick={addData} href="#" className="btn btn-primary me-2">Add</a>
        <a onClick={updateData} href="#" className="btn btn-secondary me-2">Update</a>
        <a onClick={removeData} href="#" className="btn btn-danger">Remove</a>
      </div>
      <div className="row">
        <div className="col">
          <div className={styles.svgContainer} id="horContainer"></div>
        </div>
        <div className="col">
          <div className={styles.svgContainer} id="vertContainer"></div>
        </div>
      </div>
      {/* <div className="row">
        <div className="col">
          <div className={styles.svgContainer} id="multiContainer"></div>
        </div>
      </div> */}
    </>
  )
};

function randomInteger(min: number, max: number, exclude?: number) {
  while (true) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (exclude === undefined || value !== exclude) return value;
  }
}

export default BarGraphComponent;
