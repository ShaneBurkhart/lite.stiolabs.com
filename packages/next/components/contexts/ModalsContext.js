// ModalsContext.js
import React, { createContext, useState } from "react";

const ModalsContext = createContext();

export const ModalsProvider = ({ children }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadTakeoffModalOpen, setUploadTakeoffModalOpen] = useState(false);

  const toggleShareModal = () => setShareModalOpen((prev) => !prev);
  const toggleUploadTakeoffModal = () => setUploadTakeoffModalOpen((prev) => !prev);

  return (
    <ModalsContext.Provider
      value={{
        shareModalOpen,
        uploadTakeoffModalOpen,
        toggleShareModal,
        toggleUploadTakeoffModal,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
};