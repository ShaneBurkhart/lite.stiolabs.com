import React, { useState, useRef, useContext } from "react";
// import useClickawayListener from "util/useClickawayListener";
// import { COLORS as hexes, hexNumLookupTable as hexNumLookup } from "gmi-annotation-tool/dist/canvas-react/config/colors";
// import { _groupedShapes, shapeKeyMap } from "gmi-annotation-tool/dist/canvas-react/config/shapes";

import svgIcons from '../../svgIcons';
import SVGButton from "../SVGButton";

// import { ProjectContext } from "project/contexts/ProjectContext";

const { CursorIcon, PointerCursorIcon, ChecklistIcon, CameraIcon, TextIcon, UndoIcon, RedoIcon } = svgIcons;


export default function RightControls({ selectedTool, setSelectedTool, setSelectedColor, setSelectedStampKey, selectedStampKey, drawerIsOpen, selectedColor, hasCalibration }) {
  const [menu, setMenu] = useState({});
  const [open, setOpen] = useState(true);
  // const color = (hexNumLookup[selectedColor] || hexes[0] || {}).string;
  const color = "white"
  // const { allStamps } = useContext(ProjectContext);

  const closeMenu = () => setMenu({})
  
  const _clickawayRef = useRef(null);
  // useClickawayListener(_clickawayRef, closeMenu);
  
  // const basicShapes = _groupedShapes.basic.filter(s => !['arrow','cloud'].includes(s.key))
  // const menuGroups = [basicShapes, _groupedShapes.hyperlink, _groupedShapes.measurement]
  const groupIcons = ['BasicShapesIcon', 'LinkIcon', 'CalibrationIcon']


  const toggleMenus = (menuName) => {
    const _menu = menu[menuName] ? { [menuName]: !menu[menuName] } : { [menuName]: true }
    setMenu(_menu);
  }

  const changeColor = (hexNum) => {
    setSelectedColor(hexNum);
    closeMenu();
  };

  const changeTool = (shapeKey) => {
    setSelectedTool(shapeKey);
    closeMenu();
  }

  const disabledKeys = {
    'calibration': hasCalibration,
    'line-length': !hasCalibration,
    'spline-length': !hasCalibration,
    'rectangle-area': !hasCalibration,
    'spline-area': !hasCalibration,
  }

  const baseStyles = 'absolute items-end justify-end text-left pointer-events-none';
  
  return (
    <>
      <section
        ref={_clickawayRef}
        className={`${baseStyles} flex top-0 flex-col z-20 right-0 ${drawerIsOpen ? '-translate-x-96' : '-translate-x-0'} transition-transform duration-200 ease-linear`}
      >
        <div className="flex flex-row bg-gray-900 pointer-events-auto">
          <SVGButton
            selected={selectedTool === "multiSelect"}
            svgIcon={<UndoIcon height="24px" width="24px" fill="white" />}
            onClick={_ => changeTool("multiSelect")}
            className="w-10"
          />
          <SVGButton
            selected={selectedTool === "multiSelect"}
            svgIcon={<RedoIcon height="24px" width="24px" fill="white" />}
            onClick={_ => changeTool("multiSelect")}
            className="w-10"
          />
          <div
            className="px-5 bg-orange-500 text-white font-bold items-center justify-center flex hover:bg-orange-700 cursor-pointer"
            style={{ textShadow: "0 0 1px rgba(1,1,1,0.5)" }} 
          >

            Share
          </div>
          <SVGButton
            selected={selectedTool === "select"}
            svgIcon={<CursorIcon height="24px" width="24px" fill="white" />}
            // onClick={_ => setOpen(!open)}
            className="w-10"
          />
        </div>

        {open && (
          <div className="pointer-events-auto flex flex-col bg-gray-900">
          <SVGButton
            selected={selectedTool === "multiSelect"}
            svgIcon={<PointerCursorIcon height="24px" width="24px" fill="white" />}
            onClick={_ => changeTool("multiSelect")}
            className="w-10"
          />
          {/* {["cloud", "arrow", "pen", "highlight"].map(key => {
            const Icon = svgIcons[shapeKeyMap[key].icon]
            return (
              <SVGButton
                key={key}
                selected={selectedTool === key}
                svgIcon={<Icon />}
                onClick={_ => changeTool(key)}
                className="w-10"
              />
            )
          })} */}
          <SVGButton
            svgIcon={<TextIcon height={24} width={24} fill="white" />}
            selected={selectedTool === "text"}
            onClick={_ => changeTool("text")}
            className="w-10"
          />

          {/* MENU GROUPS -- BASIC SHAPES, LINK SHAPES, MEASUREMENT SHAPES */}
          
          {/* {menuGroups.map((group,i) => {
            const GroupIcon = svgIcons[groupIcons[i]];
            const key = group[0].group
            return (
              <div className="relative" key={key}>
                <SVGButton
                  selected={group.map(shape => shape.key).includes(selectedTool)}
                  svgIcon={<GroupIcon />}
                  onClick={() => toggleMenus(key)}
                  className="w-10"
                />
                {!!menu[key] && (
                  <div className={`${baseStyles} flex top-0 flex-row p-1 right-12`}>
                    {group.map(shape => {
                      const Icon = svgIcons[shape.icon]
                      const iconProps = disabledKeys[shape.key] ? { stroke: "#555555" } : {};
                      return (
                        <SVGButton
                          disabled={disabledKeys[shape.key]}
                          key={shape.key}
                          svgIcon={<Icon {...iconProps} />}
                          selected={selectedTool === shape.key}
                          onClick={_ => changeTool(shape.key)}
                          title={shape.display}
                          className="w-10"
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })} */}

          {/* ADD A STAMP - AKA TASKS - SECTION */}
          <div className="relative">
            <SVGButton
              selected={selectedTool === "stamp"}
              svgIcon={<ChecklistIcon height={24} width={24} fill="white" />}
              onClick={() => toggleMenus('tasks')}
              className="w-10"
            />

            {/* {!!menu.tasks && (
              <div className={`${baseStyles} flex top-0 flex-col w-48 p-1 overflow-y-auto h-52 right-12`}>
                {allStamps.map(s => (
                  <SVGButton
                    key={s.key}
                    selected={selectedTool === 'stamp' && (selectedStampKey || '').toLowerCase() === (s.key || '').toLowerCase()}
                    svgIcon={<StampIcon innerText={(s.key || '').toUpperCase()} />}
                    onClick={() => {
                      changeTool('stamp');
                      setSelectedStampKey(s.key);
                    }}
                    className="rounded"
                    innerText={s.title}
                  />
                ))}
              </div>
            )} */}
          </div>

          {/* CAMERA SECTION */}
          <SVGButton
            selected={selectedTool === 'camera'}
            onClick={_ => changeTool("camera")}
            svgIcon={<CameraIcon height={24} width={24} fill="white" />}
            className="w-10"
          />

          {/* COLOR SECTION */}
          
          <div className="relative">
            <SVGButton
              onClick={() => toggleMenus('colors')}
              svgIcon={<ColorIcon hex={color} />}
              className="w-10"
            />

            {!!menu.colors && (
              <div className={`${baseStyles} top-0 grid items-center justify-center grid-cols-4 p-1 w-44 right-12`}>
                {(hexes || []).map(hex => (
                  <SVGButton
                    key={hex.name}
                    svgIcon={<ColorIcon hex={hex.string} />}
                    className="w-10"
                    onClick={() => changeColor(hex.num)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </section>
    </>
  );
}

const ColorIcon = ({ hex }) => (
  <svg width="26" height="26" className="color">
    <g><circle strokeWidth="2" stroke="#FFFFFF" r="11" cx="13" cy="13" fill={hex}></circle></g>
  </svg>
)

const StampIcon = ({ innerText }) => (
  <svg width="26" height="26" className="stamp" fillOpacity="active" strokeOpacity="active">
    <g transform="scale(0.6666666666666666)">
      <g><circle strokeWidth="2" stroke="#FFFFFF" r="18" cx="20" cy="20" fill="none"></circle></g>
      <text x="20" y="20" dy="6px" fontSize="18px" textAnchor="middle" fill="#FFFFFF" style={{ fontWeight: 600 }}>{innerText}</text>
    </g>
  </svg>
)
