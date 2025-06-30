import { createContext, useContext, useMemo } from 'react';

const FormPathContext = createContext('');

export const FormPathProvider = ({ path, children }) => {
  const contextValue = useMemo(() => path.split('.').filter(Boolean).join('.'), [path]);

  return (
    <FormPathContext.Provider value={contextValue}>
      {children}
    </FormPathContext.Provider>
  );
};

export const useFormParameter = () => {
  const path = useContext(FormPathContext);
  return { path };
};

export default FormPathContext;
