import React, { useState, useRef, useEffect } from 'react';

const FocusEditable = ({ children, value, wrapperClassName, className, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = (e) => {
    setIsEditing(false);
    if (onChange) onChange(e.target.value);
  };

  const handleInputValueChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current.blur();
    }
  };

  return (
    <div className={wrapperClassName} onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputValueChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[
						"focus:outline-none",
						className
					].join(' ')}
        />
      ) : (
        children
      )}
    </div>
  );
};

export default FocusEditable;
