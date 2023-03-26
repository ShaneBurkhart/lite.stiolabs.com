import React from 'react';

const DataTableColumn = ({ children }) => {
  return (
    <div className="flex-shrink-0" style={{ width: '150px' }}>
      {children}
    </div>
  );
};

export default DataTableColumn;
