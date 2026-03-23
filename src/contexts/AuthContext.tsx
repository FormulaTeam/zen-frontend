import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  FC
} from "react";
import { Role } from "../utils/interfaces";
import { PERMISSION_TYPES } from "../utils/utils";

export interface User {
  gender?: "male" | "female";
  firstName?: string;
  lastName?: string;
  displayName?: string;
  upn?: string;
}

/**
 * Static role catalog mirroring formula-gear's roleId values.
 * role_id values: 1=formAdmin, 2=allResponsesManager, 3=allResponsesManagerWithoutDeletion,
 *                 4=responsesCreator, 5=allResponsesReader, 6=ownResponsesManagerWithoutDeletion
 */
const ROLE_CATALOG: Role[] = [
  {
    _id: "1",
    role_id: 1,
    roleName: "מנהל טופס",
    role_description: "גישה מלאה לטופס",
    permission_types: Object.values(PERMISSION_TYPES),
    form_id: null,
  },
  {
    _id: "2",
    role_id: 2,
    roleName: "מנהל תגובות",
    role_description: "צפייה, עריכה ומחיקה של כל התגובות",
    permission_types: [
      PERMISSION_TYPES.VIEW_RESPONSE,
      PERMISSION_TYPES.CREATE_RESPONSE,
      PERMISSION_TYPES.EDIT_RESPONSE,
      PERMISSION_TYPES.DELETE_RESPONSE,
    ],
    form_id: null,
  },
  {
    _id: "3",
    role_id: 3,
    roleName: "מנהל תגובות ללא מחיקה",
    role_description: "צפייה ועריכה של כל התגובות",
    permission_types: [
      PERMISSION_TYPES.VIEW_RESPONSE,
      PERMISSION_TYPES.CREATE_RESPONSE,
      PERMISSION_TYPES.EDIT_RESPONSE,
    ],
    form_id: null,
  },
  {
    _id: "4",
    role_id: 4,
    roleName: "יוצר תגובות",
    role_description: "יצירת תגובות בלבד",
    permission_types: [PERMISSION_TYPES.CREATE_RESPONSE],
    form_id: null,
  },
  {
    _id: "5",
    role_id: 5,
    roleName: "קורא תגובות",
    role_description: "צפייה בכל התגובות",
    permission_types: [PERMISSION_TYPES.VIEW_RESPONSE],
    form_id: null,
  },
  {
    _id: "6",
    role_id: 6,
    roleName: "מנהל תגובות אישיות",
    role_description: "עריכה ומחיקה של תגובות אישיות",
    permission_types: [
      PERMISSION_TYPES.CREATE_RESPONSE,
      PERMISSION_TYPES.EDIT_RESPONSE,
      PERMISSION_TYPES.VIEW_YOUR_RESPONSES,
    ],
    form_id: null,
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: ({ user }: { user: User }) => void;
  roles: Role[];
}

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth: Custom hook to access authentication context.
 * Throws an error if used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider: Provides authentication state and methods across the app.
 * roles is a static catalog derived from formula-gear's roleId constants.
 */
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(({ user }: { user: User }) => {
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, roles: ROLE_CATALOG }}>
      {children}
    </AuthContext.Provider>
  );
};
