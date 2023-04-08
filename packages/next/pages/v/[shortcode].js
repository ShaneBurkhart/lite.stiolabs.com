import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { RingLoader } from 'react-spinners';
import tw from 'tailwind-styled-components';

import TakeoffInputTable from '@/components/TakeoffInputTable';
import ProjectSummary from '@/components/ProjectSummary';

const LoadingContainer = tw.div`
  h-screen w-full flex justify-center items-center
`;


import PulseRightScrollingPane from '@/components/PulseRightScrollingPane';
import SheetEditor from '@/components/SheetEditor';
import { SheetEditorContext, SheetEditorContextProvider } from '@/components/contexts/SheetEditorContext';


function Project() {
  return (
    <SheetEditorContextProvider>
      <SheetEditor />
    </SheetEditorContextProvider>
  )
}

export default Project;

// export default PulseRightScrollingPane;

// export default ProjectSummary;