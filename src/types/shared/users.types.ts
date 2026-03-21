import { z } from "zod";

import {
  CreateUserSchema,
  GetUsersQuerySchema,
  UserPersonalSchema,
  UserSchema,
} from "formula-gear";

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type GetUsersQueryDto = z.infer<typeof GetUsersQuerySchema>;
export type UserDto = z.infer<typeof UserSchema>;
export type UserPersonalDto = z.infer<typeof UserPersonalSchema>;
