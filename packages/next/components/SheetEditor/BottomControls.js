import React, { useContext } from "react";
import svgIcons from "../../svgIcons";

// import { SheetEditorContext } from "project/contexts/SheetEditorContext";
// import { UndoRedoContext } from "project/contexts/UndoRedoContext";

import { BottomControlsSheetSelect } from "./SheetSelect";
import { ShapeContextControls } from "./ShapeContextControls";
import SVGButton from "../SVGButton";

const { LeftArrowIcon, RightArrowIcon, UndoIcon, RedoIcon } = svgIcons;

export default function BottomControls() {
  const { undo, redo, getUndoDisabled, getRedoDisabled } = useContext(UndoRedoContext);
  const { recentSheets, sheet, sheets: allSheets, setSheet, selectedShape, selectedShapes } = useContext(SheetEditorContext);

  const sheetIndex = allSheets.indexOf(sheet);
  const prevDisabled = sheetIndex === -1 || sheetIndex <= 0;
  const nextDisabled = sheetIndex === -1 || sheetIndex >= allSheets.length - 1;

  const onClickPrev = () => {
    if (prevDisabled) return;
    setSheet(allSheets[sheetIndex - 1]);
  };

  const onClickNext = () => {
    if (nextDisabled) return;
    setSheet(allSheets[sheetIndex + 1]);
  };

  const twGray900 = "#111827";
  const undoDisabled = getUndoDisabled();
  const redoDisabled = getRedoDisabled();

  return (
    <>
      <div className="absolute z-40 flex flex-row rounded bottom-2 left-2">
        <div className="flex flex-row p-1 mr-4 bg-gray-900 rounded ring-2 ring-white ring-opacity-10">
          <SVGButton
            onClick={undo}
            title="undo last action"
            svgIcon={ <UndoIcon height={22} width={22} fill="white" stroke={twGray900} opacity={undoDisabled ? 0.5 : 1} /> }
            disabled={undoDisabled}
            className="w-10 mr-2"
          />
          <SVGButton
            onClick={redo}
            title="redo last action"
            svgIcon={ <RedoIcon height={22} width={22} fill="white" stroke={twGray900} opacity={redoDisabled ? 0.5 : 1} /> }
            disabled={redoDisabled}
            className="w-10"
          />
        </div>
        <BottomControlsSheetSelect sheet={sheet} sheetChange={setSheet} />
        <div className="flex flex-row p-1 ml-4 bg-gray-900 rounded ring-2 ring-white ring-opacity-10">
          <SVGButton
            onClick={onClickPrev}
            title="go to previous sheet"
            svgIcon={ <LeftArrowIcon height={28} width={28} fill="white" opacity={prevDisabled ? 0.5 : 1} /> }
            disabled={prevDisabled}
            className="w-10 mr-2"
          />
          <SVGButton
            onClick={onClickNext}
            title="go to next sheet"
            svgIcon={ <RightArrowIcon height={28} width={28} fill="white" opacity={nextDisabled ? 0.5 : 1} /> }
            disabled={nextDisabled}
            className="w-10"
          />
        </div>
        <div className="flex pl-4 overflow-x-scroll" style={{ width: 750 }}>
          {recentSheets.length > 0 &&
            recentSheets.map((recentSheet, index) => {
              let title = recentSheet.num;
              if (recentSheet.name) title += ` - ${recentSheet.name}`;
              return (
                <div
                  className="flex flex-row items-center p-1 ml-1 text-gray-300 rounded ring-2 ring-white ring-opacity-10"
                  key={recentSheet.id}
                >
                  <SVGButton
                    onClick={() => setSheet(recentSheet)}
                    title={"go to " + recentSheet.num}
                    svgIcon={title}
                    selected={sheet.id === recentSheet.id}
                    className="px-2"
                  />
                </div>
              );
            })}
        </div>
      </div>
      {!!selectedShapes.length && (
        <ShapeContextControls selectedShapes={selectedShapes} selectedShape={selectedShape} />
      )}
    </>
  );
}
