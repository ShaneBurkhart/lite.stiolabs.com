import React, { useState, useContext } from 'react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { dateObjSortDesc } from 'gmi-utils';

import { ProjectContext } from '../../../contexts/ProjectContext';

import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';
import { SheetTagsInput } from '../../../components/TagsInput';
import { VersionSetsSelect, Option } from '../../VersionSetsSelect';

import Button from 'shared/components/Button';
import { LoadingSpinner } from 'shared/components/LoadingSpinner';


export default function SheetInfoDrawer({ onClose, sheet={} }){
  const { project, updateSheets } = useContext(ProjectContext)
  
  const versionSets = project.VersionSets || [];
  const sortedVersionSets = [...versionSets].sort(dateObjSortDesc('issuanceDate'));

  const [loading, setLoading] = useState(false);
  const [numErrorMessage, setNumErrorMessage] = useState('');
  const [num, setNum] = useState(sheet.num || '');
  const [name, setName] = useState(sheet.name || '');
  const [versionSetId, setVersionSetId] = useState(sheet.VersionSetId || '');
  const [tags, setTags] = useState(sheet.tags || []);
  //TODO: validate num
  //TODO: unsaved changes warning message

  const form = {}
  if (versionSetId !== sheet.VersionSetId) form.newVersionSetId = versionSetId;
  if (num !== sheet.num) form.newSheetNum = num;
  if (name !== sheet.name) form.newSheetName = name;
  if (tags.length !== (sheet.tags || []).length || tags.forEach(t => !(sheet.tags || []).includes(t))) {
    form.newTagSet = tags;
  }
  const isDirty = !!Object.keys(form).length;

  const handleSubmit = () => {
    setLoading(true);
    
    const onSuccess = () => setLoading(false);
    const onError = () => setLoading(false);
    const sheetsData = {
      sheetIds: [sheet.id],
      ...form
    }

    updateSheets(sheetsData, onSuccess, onError);
  }

  const vsHistory = sortedVersionSets.filter(v => (v.Sheets || []).some(s => s.num === sheet.num));

  const Label = ({ htmlFor, children }) => <label className="block py-2 font-medium" htmlFor={htmlFor}>{children}</label>
  
  return (
    <DrawerWrapper>
      <DrawerHeader title="Sheet Info" onClose={onClose} />
      <div className="flex flex-col text-sm">
        <div>
          <Label htmlFor="num">Number</Label>
          <input
            id="num"
            type="text"
            className="block w-full text-sm rounded"
            value={num}
            onChange={e => setNum(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="name">Title</Label>
          <input
            id="name"
            type="text"
            className="block w-full text-sm rounded"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="vs">Version Set</Label>
          <VersionSetsSelect
            onChange={(vsId) => {
              setVersionSetId(vsId);
              //TODO: validate name in new version set //getSheetNumIsValid(editedSheetNum, vsId, false);
            }}
            selectedVersionSet={versionSets.find(v => v.id === versionSetId)}
          >
            {(sortedVersionSets || []).map(vs => (
              <Option key={vs.id} value={vs.id}>
                <div>{vs.name}</div>
                <div className="text-xs text-gray-500">Issuance date: {vs.formattedIssuanceDate}</div>
              </Option>
            ))}
          </VersionSetsSelect>
        </div>
        <div>
          <Label htmlFor="downshift-0-input">Tags</Label>
          <SheetTagsInput
            tags={tags}
            onUpdate={setTags}
          />
        </div>
        <div className="pb-2 mt-4 border-t border-gray-200">
          <div className="py-2 font-medium">Version Set History</div>
          <div className="py-1 overflow-y-auto bg-white border border-gray-200 rounded" style={{ maxHeight: 185 }}>
            <ul role="list" className="mx-2 divide-y divide-gray-100">
              {vsHistory.map(vs => {
                const isCurrent = vs.id === sheet.VersionSetId;
                const multiple = vsHistory.length > 1;
                return (
                  <li key={vs.id} className={`px-2 py-1 rounded ${(isCurrent && multiple) ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm tracking-wide">{vs.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          Issued: {vs.formattedIssuanceDate}
                        </p>
                      </div>
                      {isCurrent && <CheckCircleIcon className="w-5 h-5 text-blue-500 rounded-full"/>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div className="flex items-end flex-grow pt-3 pb-5">
          <Button
            color="blue"
            size="lg"
            className="justify-center w-full tracking-wider border border-blue-600 disabled:border-blueGray-300 hover:shadow disabled:hover:shadow-none"
            innerText="Save Changes"
            loading={loading}
            disabled={loading || !isDirty}
            title="Submit"
            onClick={handleSubmit}
          />
        </div>
        {loading && <LoadingSpinner />}
      </div>
    </DrawerWrapper>
  )
}
