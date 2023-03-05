import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BarGraphComponent from 'graphs';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BarGraphComponent />,
  },
]);

export default router;
