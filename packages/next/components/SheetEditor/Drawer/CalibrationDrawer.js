import React, { useState } from 'react';
import _ from 'underscore';


export default function CalibrationDrawer({ selectedShape, sendUpdate }) {
  const [feet, _setFeet] = useState(selectedShape?.feet || 6)
  const [inches, _setInches] = useState(selectedShape?.inches || 0)

  const setFeet = e => {
    _setFeet(e.target.value)
    selectedShape.feet = Number(e.target.value)
    sendUpdate() 
  }
  
  const setInches = e => {
    _setInches(e.target.value)
    selectedShape.inches = Number(e.target.value)
    sendUpdate() 
  }
  
  return (
    <>
      <p className="text-gray-800">This calibration will be applied as a reference for all measurement markups on this sheet.</p>
      <div className="flex -space-x-px">
        <div className="flex-1 w-1/2 min-w-0">
          <InputWrapper left>
            <label htmlFor="feet" className="sr-only">Feet</label>
            <input
              id="feet"
              type="number"
              className={inputClassNames}
              value={feet}
              min={0}
              onChange={setFeet}
            />
            <div className="text-base text-gray-400">Ft</div>
          </InputWrapper>
        </div>
        <div className="flex-1 min-w-0">
          <InputWrapper>
            <label className="sr-only" htmlFor="inches">Inches</label>
            <input
              id="inches"
              type="number"
              className={inputClassNames}
              value={inches}
              min={0}
              onChange={setInches}
            />
            <div className="text-base text-gray-400">In</div>
          </InputWrapper>
        </div>
      </div>
    </>
  )
}

const InputWrapper = ({ children, left }) => {
  const borderRadius = left ? 'rounded-tl rounded-bl' : 'rounded-tr rounded-br'
  return (
    <div className={`relative flex bg-white items-center w-full p-1 px-2 py-0 leading-6 border-2 border-gray-300 ${borderRadius} focus-within:z-10 focus-within:ring-blue-500 focus-within:ring-1 focus-within:ring-offset-0 focus-within:border-blue-500 focus-within:ring-offset-white`}>
      {children}
    </div>
  )
};

const inputClassNames = "w-full leading-6 bg-transparent border-none focus:border-none focus:ring-0 focus:ring-offset-0 text-gray-900 placeholder-gray-400";
