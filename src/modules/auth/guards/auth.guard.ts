import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../types';
import { AdminUserRole } from 'src/shared/enums';
import { createHash } from 'crypto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public using @IsPublic() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization ?? '';
    const jwtToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;
    if (!jwtToken) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = await this.authService.verifyToken(jwtToken);
      const adminUser = await this.authService.validateAdminUserFromId(
        payload.userId,
      );
      if (adminUser) {
        const isTokenValid = this.checkAccessToken(jwtToken, adminUser?.tokens);
        if (!isTokenValid) {
          throw new UnauthorizedException('Invalid token');
        }
      }

      request.userDetail = {
        id: payload.userId,
        email: payload.email,
        role: payload.role as AdminUserRole,
        isAdmin: !!adminUser,
      };
      request.jwtToken = jwtToken;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  checkAccessToken(reqToken: string, existingDbTokens: string[]) {
    const tokenHash = createHash('md5').update(reqToken).digest('hex');
    return existingDbTokens.includes(tokenHash);
  }
}
