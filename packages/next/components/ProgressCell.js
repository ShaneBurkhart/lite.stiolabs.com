import React, { useEffect } from 'react';
import ProgressBar from './ProgressBar';
import useEditableCell from '@/utils/hooks/useEditableCell';

const Cell = ({ completable, noEdit, isFocused, placeholder, data, progress, dark, header, headerClassName, textClassName, barClassName, className, onClick, onClickComplete, onChange, onTab, onEscape, onEnter, onFocus, onBlur, onPaste, ...rest }) => {
  const {
    inputRef,
    isEditing,
    cellData,
    onClickEdit,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onPaste: _onPaste,
    handleInputChange,
    handleKeyDown,
  } = useEditableCell(data, !!placeholder, !header, onFocus, onBlur, onChange, onEnter, onEscape, onTab, onPaste);

  const classNames = [
    "cursor-pointer border h-9 border-gray-600",
    dark ? "bg-gray-800 text-white" : "bg-white text-gray-700",
    className,
  ].join(' ');

  const barClassNames = [barClassName].join(' ');

  const textClassNames = [
    "text-gray-800",
    dark ? "text-white" : "text-gray-700",
    textClassName,
  ].join(' ');

  const inputClassNames = "w-full border border-gray-400 border-b-gray-100 border-l-gray-100 px-2 py-1 text-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-100";

  if (!noEdit && (isEditing || isFocused)) {
    return (
      <input
        autoFocus
        ref={inputRef}
        type="text"
        value={cellData+"" || ""}
        onChange={handleInputChange}
        onFocus={_onFocus}
        onKeyDown={handleKeyDown}
        onBlur={_onBlur}
        onPaste={_onPaste}
        className={inputClassNames}
        style={{ height: '35px' }}
        // {...rest}
      />
    );
  }

  const headerClassNames = [
    "w-full h-9 border border-gray-400 px-2 py-1 text-sm bg-gray-200 font-semibold text-gray-700 leading-none cursor-pointer",
    dark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700",
    className || "",
  ]

  if (header) {
    return (
      <div
        className={headerClassNames.join(' ')}
        onClick={onClick || onClickEdit}
      >
        {cellData || placeholder}
      </div>
    );
  }

  return (
    <div className="w-full flex">
      <ProgressBar progress={progress} textClassName={textClassNames} barClassName={barClassNames} className={classNames} onClick={onClickEdit} {...rest} />
      {completable && (
        <div
          className="w-20 bg-green-500 text-white text-center cursor-pointer"
          style={{ height: '34px', marginTop: 1 }}
          onClick={onClickComplete}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto mt-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Cell;
