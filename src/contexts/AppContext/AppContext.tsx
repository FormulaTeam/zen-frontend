import { createContext, useEffect, useState } from 'react';
import { AppContextType, defaultContext, SharedDataContext } from './utils';

// Create a Context with the default value
export const AppContext = createContext<AppContextType>(defaultContext);

// Create a provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState<SharedDataContext>({
    // Define your state here
    configData: {},
    filterFieldsData: []
  });

  const getInitialConfigData = async () => {

  }

    // Fetch data when the component mounts
    useEffect(() => {
      getInitialConfigData();
    }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
};
