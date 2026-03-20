import { z } from "zod";

import { CreateUserSchema, GetUsersQuerySchema, UserSchema } from "formula-gear";

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type GetUsersQueryDto = z.infer<typeof GetUsersQuerySchema>;
export type UserDto = z.infer<typeof UserSchema>;