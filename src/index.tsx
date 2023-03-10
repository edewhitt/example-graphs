import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from 'router';
import './styles/index.scss';
import reportWebVitals from './reportWebVitals';
import Navigation from 'shared/components/navigation';

const root = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(root!).render(
  <React.StrictMode>
    <Navigation />
    <div className="container-fluid">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
