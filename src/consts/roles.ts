import { role, permission, Role, Permission } from "formula-gear";

export const ROLE_CATALOG: {
  id: number;
  role_id: Role;
  roleName: string;
  role_description: string;
  permission_types: Permission[];
}[] = [
    {
      id: 1,
      role_id: role.FormAdmin,
      roleName: "שליטה מלאה",
      role_description: "גישה מלאה לטופס",
      permission_types: Object.values(permission),
    },
    {
      id: 2,
      role_id: role.AllResponsesManager,
      roleName: "ניהול תגובות",
      role_description: "צפייה, עריכה ומחיקה של כל התגובות",
      permission_types: [
        permission.ReadAnyResponse,
        permission.CreateResponse,
        permission.UpdateAnyResponse,
        permission.DeleteAnyResponse,
      ],
    },
    {
      id: 3,
      role_id: role.AllResponsesManagerWithoutDeletion,
      roleName: "ניהול תגובות ללא מחיקה",
      role_description: "צפייה ועריכה של כל התגובות",
      permission_types: [
        permission.ReadAnyResponse,
        permission.CreateResponse,
        permission.UpdateAnyResponse,
      ],
    },
    {
      id: 4,
      role_id: role.ResponsesCreator,
      roleName: "יצירת תגובות",
      role_description: "יצירת תגובות וצפייה בתגובות שהמשתמש יצר",
      permission_types: [permission.CreateResponse],
    },
    {
      id: 5,
      role_id: role.AllResponsesReader,
      roleName: "צפייה בלבד",
      role_description: "צפייה בכל התגובות",
      permission_types: [permission.ReadAnyResponse],
    },
    {
      id: 6,
      role_id: role.OwnResponsesManagerWithoutDeletion,
      roleName: "ניהול תגובות המשתמש",
      role_description: "יצירה עריכה וצפייה בתגובות שהמשתמש יצר בלבד ללא אפשרות מחיקה",
      permission_types: [
        permission.CreateResponse,
        permission.UpdateMyResponse,
        permission.ReadAnyResponse
      ],
    },
  ];
