import React, { useState } from 'react';
import _ from 'underscore';


export default function TextEditDrawer({ selectedShape, sendUpdate }) {
  const [message, _setMessage] = useState(selectedShape?.message || '')
  const [fontSize, _setFontSize] = useState(selectedShape?.fontSize || 1.25)
  const [showBorder, _setShowBorder] = useState(selectedShape?.showBorder || false)

  const setMessage = e => {
    _setMessage(e.target.value)
    selectedShape.message = e.target.value
    sendUpdate() 
  }
  
  const setFontSize = size => {
    _setFontSize(size)
    selectedShape.fontSize = Number(size)
    sendUpdate() 
  }
  
  const setShowBorder = bool => {
    _setShowBorder(bool)
    selectedShape.showBorder = bool
    sendUpdate() 
  }
  
  return (
    <>
      <div>
        <label className="block mb-2 text-base font-medium text-gray-600" htmlFor="msg">Text</label>
        <input
          id="msg"
          type="text"
          className="block w-full text-sm border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300"
          value={message}
          onChange={setMessage}
        />
      </div>
      <div className="flex flex-col sm:flex-row">
        <ButtonGroup onClick={setFontSize} fontSize={fontSize} />
        <div className="flex items-center mt-8 sm:ml-5 sm:mt-0">
          <input
            id="borders"
            type="checkbox"
            className="w-5 h-5 text-indigo-500 border-gray-300 rounded cursor-pointer focus:ring-indigo-400"
            checked={showBorder}
            onChange={() => setShowBorder(!showBorder)}
          />
          <label htmlFor="borders" className="ml-2 text-base font-medium text-gray-700 capitalize">
            Borders
          </label>
        </div>
      </div>
    </>
  )
}

//TODO: get real option values, these are just guesses, 'display' is for more dynamic ui
const options = [{val: 1, display: 13}, {val: 1.25, display: 17}, {val: 1.75, display: 20}, {val: 2.25, display: 23}];

const buttonStyles = "relative inline-flex justify-center items-end border border-gray-300 bg-white font-medium text-indigo-500 hover:bg-indigo-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300 ";
const leftButtonStyles = "rounded-l-md " + buttonStyles;
const midButtonStyles = "-ml-px "  + buttonStyles;
const rightButtonStyles = "-ml-px rounded-r-md " + buttonStyles;
const selectedStyles = " bg-indigo-50 border-indigo-300 z-10 ";

const ButtonGroup = ({ fontSize, onClick }) => (
  <div className="relative z-0 inline-flex rounded-md shadow-sm">
    {options.map((size, i) => {
      let styles = midButtonStyles;
      if (i === 0) styles = leftButtonStyles;
      if (i === options.length - 1) styles = rightButtonStyles;
      const selected = fontSize === size.val;
      return (
        <button
          key={size.val}
          className={selected ? `${styles} ${selectedStyles}` : styles}
          onClick={() => onClick(size.val)}
          style={{ fontSize: size.display, height: 40, width:45, paddingBottom: 9 }}
        >
          <span style={{ verticalAlign: 'text-bottom', lineHeight: .75 }}>A</span>
        </button>
      )
    })}
  </div>
)
