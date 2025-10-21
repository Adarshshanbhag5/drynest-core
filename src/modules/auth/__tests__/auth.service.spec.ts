import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../../admin/admin.service';
import { AllowedAdminsEntity } from '../../admin/entities/allowed-admins.entity';
import { AdminUsersEntity } from '../../admin/entities/admin-users.entity';
import * as bcrypt from 'bcryptjs';
import { AdminUserRole } from 'src/shared/enums';
jest.mock('bcryptjs', () => {
  const actual = jest.requireActual<typeof import('bcryptjs')>('bcryptjs');
  return {
    ...actual,
    compare: jest.fn(),
  } as typeof actual;
});

describe('AuthService', () => {
  let authService: AuthService;
  let adminService: jest.Mocked<AdminService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminService,
          useValue: {
            getAllowedAdminByEmail: jest.fn(),
            findAdminByEmail: jest.fn(),
            createAdminUserTransactional: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'authConfig'
                ? { jwtSecret: 'priv', jwtPublicKey: 'pub' }
                : undefined,
            ),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    adminService = moduleRef.get(AdminService);
    jwtService = moduleRef.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('signup: rejects if email not allowed', async () => {
    adminService.getAllowedAdminByEmail.mockResolvedValue(
      null as unknown as AllowedAdminsEntity,
    );
    await expect(
      authService.adminSignup('x@example.com', AdminUserRole.ADMIN, 'pass'),
    ).rejects.toThrow('Email is not allowed to sign up');
  });

  it('signup: rejects if admin exists', async () => {
    adminService.getAllowedAdminByEmail.mockResolvedValue({
      id: 'a',
      email: 'x@example.com',
    } as AllowedAdminsEntity);
    adminService.findAdminByEmail.mockResolvedValue({
      id: 'u1',
      email: 'x@example.com',
    } as AdminUsersEntity);
    await expect(
      authService.adminSignup('x@example.com', AdminUserRole.ADMIN, 'pass'),
    ).rejects.toThrow('Admin already exists');
  });

  it('signup: creates user and returns access token (transactional)', async () => {
    adminService.getAllowedAdminByEmail.mockResolvedValue({
      id: 'a',
      email: 'x@example.com',
    } as AllowedAdminsEntity);
    adminService.findAdminByEmail.mockResolvedValue(
      null as unknown as AdminUsersEntity,
    );
    const signSpy = jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValue('token');
    const txSpy = jest
      .spyOn(adminService, 'createAdminUserTransactional')
      .mockImplementation(async (email, _hash, role, afterCreate) => {
        const user = { id: 'u1', email, role } as AdminUsersEntity;
        const result = await afterCreate(user);
        return result.accessToken;
      });

    const result = await authService.adminSignup(
      'x@example.com',
      AdminUserRole.ADMIN,
      'StrongPass1!',
    );

    expect(result).toEqual({ accessToken: 'token', email: 'x@example.com' });
    expect(txSpy).toHaveBeenCalled();
    const args = txSpy.mock.calls[0];
    expect(typeof args[3]).toBe('function');
    expect(signSpy).toHaveBeenCalled();
  });

  it('signup: rolls back when transaction fails', async () => {
    adminService.getAllowedAdminByEmail.mockResolvedValue({
      id: 'a',
      email: 'x@example.com',
    } as AllowedAdminsEntity);
    adminService.findAdminByEmail.mockResolvedValue(
      null as unknown as AdminUsersEntity,
    );
    jest
      .spyOn(adminService, 'createAdminUserTransactional')
      .mockRejectedValue(new Error('tx failed'));
    await expect(
      authService.adminSignup(
        'x@example.com',
        AdminUserRole.ADMIN,
        'StrongPass1!',
      ),
    ).rejects.toThrow('tx failed');
  });

  it('login: rejects if user not found', async () => {
    adminService.findAdminByEmail.mockResolvedValue(
      null as unknown as AdminUsersEntity,
    );
    await expect(
      authService.adminLogin('x@example.com', 'pass'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('login: rejects on password mismatch', async () => {
    adminService.findAdminByEmail.mockResolvedValue({
      id: 'u1',
      email: 'x@example.com',
      role: 'ADMIN',
      passwordHash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    } as AdminUsersEntity);
    await expect(
      authService.adminLogin('x@example.com', 'wrongpass'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('login: returns access token on success', async () => {
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValueOnce(true);
    adminService.findAdminByEmail.mockResolvedValue({
      id: 'u1',
      email: 'x@example.com',
      role: 'ADMIN',
      passwordHash: 'hash',
    } as AdminUsersEntity);
    jwtService.signAsync.mockResolvedValue('access');
    (adminService.addSessionTokenHash as unknown as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);

    const result = await authService.adminLogin('x@example.com', 'pass');

    expect(result).toEqual({ accessToken: 'access', email: 'x@example.com' });
  });

  it('verifyToken: returns payload', async () => {
    const payload = { userId: 'u1', email: 'x@example.com', role: 'ADMIN' };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
    await expect(authService.verifyToken('tok')).resolves.toEqual(payload);
  });

  it('verifyToken: throws on invalid', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('bad'));
    await expect(authService.verifyToken('tok')).rejects.toThrow(
      'Invalid token',
    );
  });

  it('validateAdminUserFromId: returns user or null on failure', async () => {
    (adminService.findOne as unknown as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'x@example.com',
    } as AdminUsersEntity);
    await expect(authService.validateAdminUserFromId('u1')).resolves.toEqual({
      id: 'u1',
      email: 'x@example.com',
    });
    (adminService.findOne as unknown as jest.Mock).mockRejectedValue(
      new Error('db'),
    );
    await expect(authService.validateAdminUserFromId('u1')).resolves.toBeNull();
  });
});
