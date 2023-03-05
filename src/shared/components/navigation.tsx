import { FC } from 'react';

const Navigation: FC = () => {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px' }}>
      <div className="text-center">
        <a href="/" className="mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4">Example Graphs</span>
        </a>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="#" className="nav-link active" aria-current="page">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#bars"></use>
            </svg>
            Bars
          </a>
        </li>
      </ul>
      <hr />
    </div>
  );
};

export default Navigation;
