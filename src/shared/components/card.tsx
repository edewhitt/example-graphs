import React, { FC } from 'react';

const Card: FC<{ children?: React.ReactNode; title?: string }> = ({ children, title }) => {
  const titleDisplay = !title?.length ? '' : <div className="card-title">{title}</div>;

  return (
    <div className="card">
      <div className="card-body">
        {titleDisplay}
        {children}
      </div>
    </div>
  );
};

export default Card;
