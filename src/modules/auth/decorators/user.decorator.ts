import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../types';
import { RequestUser } from '../types';

/**
 * Decorator to extract userDetail from the authenticated request
 * Usage: @Get() getData(@User() user: RequestUser) { ... }
 */
export const User = createParamDecorator(
  (_, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.userDetail;
  },
);
