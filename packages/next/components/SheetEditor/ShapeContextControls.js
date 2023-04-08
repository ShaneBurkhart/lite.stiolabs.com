import React, { useContext } from "react";
import { UndoRedoContext } from "project/contexts/UndoRedoContext";
import { TrashIcon, BadgeCheckIcon, BackspaceIcon } from '@heroicons/react/outline';
import SVGButton from '../../../shared/components/SVGButton';


export const ShapeContextControls = ({ selectedShapes, selectedShape }) => {
  const {
    deleteAnnotations,
    publishAnnotation,
    unpublishAnnotation,
  } = useContext(UndoRedoContext)

  const disabled = {
    'delete': !selectedShapes.length,
    'publish': !selectedShape,
    'unpublish': !selectedShape,
  }

  const handleDeleteAnnotations = () => {
    if (!!selectedShapes.length) deleteAnnotations(selectedShapes)
  }

  const handlePublishAnnotation = () => {
    if (!!selectedShape) publishAnnotation(selectedShape);
  }

  const handleUnpublishAnnotation = () => {
    if (!!selectedShape) unpublishAnnotation(selectedShape);
  }

  if (!selectedShapes.length) return "";

  return (
    <div className="absolute z-40 flex justify-between p-1 space-x-1 overflow-hidden bg-gray-900 divide-x divide-white rounded ring-2 ring-white bottom-2 right-4 ring-opacity-10">
      <div>
        <SVGButton
          title="delete markup"
          disabled={disabled.delete}
          svgIcon={<TrashIcon height={26} width={26} stroke="white" opacity={disabled.delete ? .5 : 1} />} 
          className="w-10 rounded-l"
          onClick={handleDeleteAnnotations}
        />
      </div>
      {!!selectedShape && (
        <div className="pl-1">
          {selectedShape.published ? (
            <SVGButton
              title="unpublish markup"
              disabled={disabled.unpublish}
              svgIcon={<BackspaceIcon height={26} width={26} stroke="white" opacity={disabled.unpublish ? .5 : 1} />} 
              className="w-10 rounded-r"
              onClick={handleUnpublishAnnotation}
            />
          ) : (
            <SVGButton
              title="publish markup"
              disabled={disabled.publish}
              svgIcon={<BadgeCheckIcon height={26} width={26} stroke="white" strokeWidth={.5} opacity={disabled.publish ? .5 : 1} />} 
              className="w-10 "
              onClick={handlePublishAnnotation}
            />
          )}
        </div>
      )}
    </div>
  );
}
