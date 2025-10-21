import { Test } from '@nestjs/testing';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { AdminUsersEntity } from '../../admin/entities/admin-users.entity';
import { ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

function createCtx(authHeader?: string): ExecutionContext {
  const req: { headers: Record<string, string | undefined> } = {
    headers: { authorization: authHeader },
  };
  const http = { getRequest: () => req } as { getRequest: () => typeof req };
  const ctx = {
    switchToHttp: () => http,
    getHandler: () => ({}) as unknown,
    getClass: () => ({}) as unknown,
    getArgByIndex: () => undefined,
    getArgs: () => [],
    getType: () => 'http',
  } as unknown as ExecutionContext;
  return ctx;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jest.Mocked<AuthService>;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        Reflector,
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn(),
            validateAdminUserFromId: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get(AuthGuard);
    authService = moduleRef.get(AuthService);
    reflector = moduleRef.get(Reflector);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false as any);
  });

  it('rejects when missing token', async () => {
    const ctx = createCtx(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow('Missing token');
  });

  it('rejects when token invalid', async () => {
    const ctx = createCtx('Bearer bad');
    authService.verifyToken.mockRejectedValue(new Error('bad'));
    await expect(guard.canActivate(ctx)).rejects.toThrow('Invalid token');
  });

  it('accepts when token and md5 check pass', async () => {
    const ctx = createCtx('Bearer tok');
    authService.verifyToken.mockResolvedValue({
      userId: 'u1',
      email: 'x@example.com',
      role: 'ADMIN',
    } as JwtPayload);
    authService.validateAdminUserFromId.mockResolvedValue({
      id: 'u1',
      email: 'x@example.com',
      role: 'ADMIN',
      tokens: ['7694f4a66316e53c8cdd9d9954bd611d'],
    } as AdminUsersEntity);
    jest.spyOn(guard, 'checkAccessToken').mockReturnValue(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
