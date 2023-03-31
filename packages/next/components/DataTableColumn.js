import React from 'react';

const DataTableColumn = ({ children, width, className }) => {
  const w = (width || 100) + 'px';

  const classNames = [
    'flex-shrink-0',
    className || '',
  ].join(' ');

  return (
    <div className={classNames} style={{ width: w }}>
      {children}
    </div>
  );
};

export default DataTableColumn;
