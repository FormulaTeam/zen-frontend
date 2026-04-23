import { Dispatch, SetStateAction } from "react";

// Define the shape of the context state
export interface AppState {
  themeColor: string;
}

export interface UserPayLoad {
  name: string;
  UPN?: string;
  upn?: string;
  email?: string;
  azp: string;
  FirstName: string;
  LastName: string;
  family_name: string;
  given_name: string;
  displayName: string;
}

// Define the shape of the context value
export interface AppContextType {
  state: SharedDataContext;
  setState: Dispatch<SetStateAction<SharedDataContext>>;
}

// Provide a default value that matches the context shape
export const defaultState: SharedDataContext = {
  configData: {},
  filterFieldsData: [],
};

export const defaultContext: AppContextType = {
  state: defaultState,
  setState: () => { },
};

export interface SharedDataContext {
  // add here props
}
