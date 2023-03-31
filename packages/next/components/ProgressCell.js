import React, { useRef, useState } from 'react';
import ProgressBar from './ProgressBar';

const Cell = ({ completable, data, progress, dark, textClassName, barClassName, className, onChange, onClick, onDoubleClick, ...rest }) => {
  const _clickTimeout = useRef(null);
  const _inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [_data, setData] = useState(data);

  const classNames = [
    "cursor-pointer border h-9 border-gray-600",
    dark ? "bg-gray-800 text-white" : "bg-white text-gray-700",
    className,
  ]

  const barClassNames = [
    barClassName
  ].join(' ')

  const textClassNames = [
    "text-gray-800",
    dark ? "text-white" : "text-gray-700",
    textClassName
  ].join(' ')

  const onClickEdit = e => {
    setIsEditing(true)
    const tryfocus = (stop) => {
      setTimeout(()=>{
        if (!_inputRef.current) {
          tryfocus(true)
          return;
        }
        _inputRef.current.focus()
      }, 100)
    }

    tryfocus();
  }

  const onFocus = e => {
    // select all
    setTimeout(()=>{
      _inputRef.current.setSelectionRange(0, 9999);
    }, 200)
  }

  const onBlur = e => {
    setIsEditing(false)
    if (onChange) onChange(e)
  }

  const _onChange = e => {
    // const v = e.target.value;
    // if (v === '') {
    //   setData(0)
    // }
    console.log('change', e.target.value)
    setData(Number(e.target.value))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      _inputRef.current.blur();
    }
  };

  const _onClick = e => {
    onClickEdit(e)
    // if (onDoubleClick) onDoubleClick(e)
    // if (_clickTimeout.current !== null) {
    //   console.log('double click executes')
    //     if (onClickEdit) onClickEdit()
    //   clearTimeout(_clickTimeout.current)
    //   _clickTimeout.current = null
    // } else {
    //   console.log('single click')  
    //   _clickTimeout.current = setTimeout(()=>{
    //   if (onDoubleClick) onDoubleClick()
    //     clearTimeout(_clickTimeout.current)
    //     _clickTimeout.current = null
    //   }, 500)
    // }
  }

  const _onDoubleClick = e => {
    e.preventDefault()
    e.stopPropagation()
    if (onDoubleClick) onDoubleClick(e)
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        ref={_inputRef}
        type="text"
        value={_data || ""}
        onChange={_onChange}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        className="w-full border border-gray-400 border-b-gray-100 border-l-gray-100 px-2 py-1 text-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        style={{ height: '35px' }}
        // {...rest}
      />
    );
  }


  return (
    <div className="w-full flex">
      <ProgressBar progress={progress} textClassName={textClassNames} barClassName={barClassNames} className={classNames.join(' ')} {...rest} onClick={_onClick} /> 
      {completable && (
        <div
          onClick={_onDoubleClick}
          className="w-20 bg-green-500 text-white text-center cursor-pointer"
          style={{ height: '34px', marginTop: 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto mt-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
  // return (
  //   <input
  //     type="text"
  //     value={value}
  //     onChange={onChange}
  //     onFocus={onFocus}
  //     onBlur={onBlur}
  //     className="w-full border border-gray-400 border-b-gray-100 border-l-gray-100 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
	// 		style={{ height: '35px' }}
  //     {...rest}
  //   />
  // );
};

export default Cell;
