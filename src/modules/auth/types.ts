import { Request } from 'express';
import { AdminUserRole } from 'src/shared/enums';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ValidatedUser {
  userId: string;
  email: string;
  role: string;
}

export interface RequestUser {
  id: string;
  email: string;
  role: AdminUserRole;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  jwtToken: string;
  userDetail: RequestUser;
}
