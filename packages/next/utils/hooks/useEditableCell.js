import { useRef, useState, useEffect } from 'react';

const useEditableCell = (data, controlled, isNumber, onFocus, onBlur, onChange, onEnter, onEscape, onTab, onPaste) => {
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cellData, setCellData] = useState(data);

  useEffect(() => {
    setCellData(data);
  }, [data]);

  const onClickEdit = () => {
    setIsEditing(true);
    const tryFocus = () => {
      setTimeout(() => {
        console.log(inputRef.current);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };
    tryFocus();
  };

  const _onFocus = () => {
    console.log('focus');
    if (onFocus) onFocus();
    setTimeout(() => {
      inputRef.current?.setSelectionRange(0, 9999);
    }, 100);
  };

  const _onBlur = () => {
    setIsEditing(false);
    if (onChange) {
      if (onBlur) onBlur();
      onChange(cellData);
    }
  };

  const handleInputChange = (e) => {
    const newData = isNumber ? Number(e.target.value) : e.target.value;
    if (newData !== cellData) {
      if (!controlled) setCellData(newData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      e.stopPropagation();
      e.preventDefault();
      _onBlur();
      onEnter({ shift: e.shiftKey, cmd: e.metaKey, ctrl: e.ctrlKey })
    } else if (e.key === 'Escape' && onEscape) {
      e.stopPropagation();
      e.preventDefault();
      _onBlur();
      onEscape()
    } else if (e.key === 'Tab' && onTab) {
      e.stopPropagation();
      e.preventDefault();
      _onBlur();
      onTab({ shift: e.shiftKey, cmd: e.metaKey, ctrl: e.ctrlKey }); 
    }
  };

  return {
    inputRef,
    isEditing,
    cellData,
    onClickEdit,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onPaste,
    handleInputChange,
    handleKeyDown,
  };
};

export default useEditableCell;
