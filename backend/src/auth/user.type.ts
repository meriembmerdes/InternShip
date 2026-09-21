import { Role, UserStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isActive: UserStatus;
}