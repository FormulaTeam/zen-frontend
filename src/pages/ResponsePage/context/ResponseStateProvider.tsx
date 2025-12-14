import { createContext, PropsWithChildren, useContext, useState, useMemo } from "react";
import { Form, FormField, ResponseFieldValue } from "utils/interfaces";

interface IResponseStateContextContextProps {
  form: Form | null;
  setForm: (form: Form) => void;
  connectedForms: FormField[];
  setConnectedForms: (connectedForms: FormField[]) => void;
  responseData: ResponseFieldValue[];
  setResponseData: (responseData: ResponseFieldValue[]) => void;
}

const ResponseStateContext = createContext<IResponseStateContextContextProps | undefined>(
  undefined,
);

export const useResponseStateContext = () => {
  const context = useContext(ResponseStateContext);

  if (!context) {
    throw new Error("useResponseStateContext must be used within a ResponseStateContextProvider");
  }

  return context;
};

export const ResponseStateContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [connectedForms, setConnectedForms] = useState<FormField[]>([]);
  const [responseData, setResponseData] = useState<ResponseFieldValue[]>([]);

  const responseStateContextValue = useMemo(
    () => ({
      form,
      setForm,
      connectedForms,
      setConnectedForms,
      responseData,
      setResponseData,
    }),
    [form, connectedForms, responseData],
  );

  return (
    <ResponseStateContext.Provider value={responseStateContextValue}>
      {children}
    </ResponseStateContext.Provider>
  );
};
