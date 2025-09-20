import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Defines the structure of the FormChangesContext, which is used
 * to manage unsaved form changes, alert messages, and exit behavior.
 */
interface FormChangesContextType {
  /** Indicates if there are unsaved changes in the form */
  hasUnsavedChanges: boolean;

  /** Sets whether the form has unsaved changes */
  setHasUnsavedChanges: (val: boolean) => void;

  /** Saves form changes. The `exit` flag determines if it’s part of an exit flow */
  saveFormChanges: (exit: boolean) => Promise<void>;

  /** Registers a save handler to be invoked during form submission or exit */
  setSaveHandler: (fn: (exit: boolean) => Promise<void>) => void;

  /** Optional function to announce unsaved changes (typically opens a confirmation dialog) */
  announceUnsavedChanges?: () => void;

  /** Sets the handler function that will be triggered on unsaved changes announcement */
  setAnnounceHandler: (fn: () => void) => void;

  /** Controls visibility of the unsaved changes alert message */
  showAlertMsg: boolean;

  /** Sets visibility of the alert popup */
  setShowAlertMsg: (val: boolean) => void;

  /** The message displayed in the alert popup */
  alertMsg: string;

  /** Sets the alert message string */
  setAlertMsg: (msg: string) => void;

  /** Sets the function to run after confirming exit without saving */
  setExitHandler: (fn: (exit: boolean) => void) => void;

  /** Function to execute upon exit (without necessarily saving) */
  exitFn?: (exit: boolean) => void;

  /** Controls whether buttons (e.g., "Save" and "Cancel") should appear in the popup */
  showButtonsOnPopup: boolean;

  /** Sets the visibility of buttons in the popup */
  setShowButtonsOnPopup: (val: boolean) => void;
}

// Default context values
const FormChangesContext = createContext<FormChangesContextType>({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
  saveFormChanges: async () => {},
  setSaveHandler: () => {},
  announceUnsavedChanges: () => {},
  setAnnounceHandler: () => {},
  showAlertMsg: false,
  setShowAlertMsg: () => {},
  alertMsg: "",
  setAlertMsg: () => {},
  setExitHandler: () => {},
  exitFn: () => {},
  showButtonsOnPopup: true,
  setShowButtonsOnPopup: () => {},
});

/**
 * Custom hook to access and interact with the FormChangesContext
 */
export const useFormChanges = () => useContext(FormChangesContext);

interface FormChangesProviderProps {
  /** React children to be wrapped by the provider */
  children: ReactNode;
}

/**
 * Provider component that supplies state and handlers for managing form changes,
 * alert messages, and exit behaviors across the app.
 */
export const FormChangesProvider = ({ children }: FormChangesProviderProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveFormFn, setSaveFormFn] = useState<(exit: boolean) => Promise<void>>(
    () => async () => {},
  );
  const [exitFn, setExitFn] = useState<(exit: boolean) => void>(() => () => {});
  const [showAlertMsg, setShowAlertMsg] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string>("");
  const [announceFn, setAnnounceFn] = useState<() => void>(() => () => {});
  const [showButtonsOnPopup, setShowButtonsOnPopup] = useState<boolean>(true);

  /** Registers a handler function to be used for saving form changes */
  const setSaveHandler = (fn: (exit: boolean) => Promise<void>) => {
    setSaveFormFn(() => fn);
  };

  /** Registers a handler to be called when unsaved changes should be announced */
  const setAnnounceHandler = (fn: () => void) => {
    setAnnounceFn(() => fn);
  };

  /** Registers a function to be called when exiting without saving */
  const setExitHandler = (fn: (exit: boolean) => void) => {
    setExitFn(() => fn);
  };

  return (
    <FormChangesContext.Provider
      value={{
        showAlertMsg,
        setShowAlertMsg,
        alertMsg,
        setAlertMsg,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        saveFormChanges: saveFormFn,
        setSaveHandler,
        setExitHandler,
        exitFn,
        announceUnsavedChanges: announceFn,
        setAnnounceHandler,
        showButtonsOnPopup,
        setShowButtonsOnPopup,
      }}>
      {children}
    </FormChangesContext.Provider>
  );
};
