import React from 'react';
import BarsPage from 'pages/bars';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BarsPage />,
  },
]);

export default router;
