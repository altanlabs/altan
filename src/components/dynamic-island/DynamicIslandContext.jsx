// DynamicIslandContext.js
import React, { createContext, useContext, useState } from 'react';

export const DynamicIslandContext = createContext();

export const useDynamicIslandContext = () => {
  return useContext(DynamicIslandContext);
};

export const DynamicIslandProvider = ({ children }) => {
  const [islandState, setIslandState] = useState({});
  return (
    <DynamicIslandContext.Provider value={{ islandState, setIslandState }}>
      {children}
    </DynamicIslandContext.Provider>
  );
};
