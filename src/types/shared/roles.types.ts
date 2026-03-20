import { z } from "zod";

import { FormRolesSchema, UserRoleSchema } from "formula-gear";

export type FormRoleDto = z.infer<typeof FormRolesSchema>;
export type UserRoleDto = z.infer<typeof UserRoleSchema>;