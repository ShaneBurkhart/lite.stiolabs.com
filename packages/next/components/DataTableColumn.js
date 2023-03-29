import React from 'react';

const DataTableColumn = ({ children, width }) => {
  const w = (width || 100) + 'px';

  return (
    <div className="flex-shrink-0" style={{ width: w }}>
      {children}
    </div>
  );
};

export default DataTableColumn;
