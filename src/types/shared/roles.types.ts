import { z } from "zod";

import { FormRolesSchema } from "formula-gear";

export type FormRoleDto = z.infer<typeof FormRolesSchema>;