import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AdminUsersEntity } from '../admin/entities/admin-users.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AdminService } from '../admin/admin.service.js';
import { JwtPayload } from './types.js';
import { AdminUserRole } from 'src/shared/enums';
import { AuthResponseDto } from './dto/auth.dto';
import { AuthConfig } from 'src/config/auth.config';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authConfig: AuthConfig;
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const authConfig = this.configService.get<AuthConfig>('authConfig');
    if (!authConfig) {
      this.logger.error('[AuthService] authConfig not found!');
      return;
    }

    this.authConfig = authConfig;
  }

  private async ensureAllowed(email: string) {
    const allowed = await this.adminService.getAllowedAdminByEmail(email);
    if (!allowed) {
      throw new ForbiddenException('Email is not allowed to sign up');
    }
  }

  private async generateAccessToken(user: AdminUsersEntity) {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.authConfig.jwtSecret,
      algorithm: 'RS256',
      expiresIn: '2d',
    });
    return accessToken;
  }

  async verifyToken(jwtToken: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwtToken, {
        publicKey: this.authConfig.jwtPublicKey,
        algorithms: ['RS256'],
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async adminSignup(
    email: string,
    role: AdminUserRole,
    password: string,
  ): Promise<AuthResponseDto> {
    await this.ensureAllowed(email);

    const existing = await this.adminService.findAdminByEmail(email);
    if (existing) {
      throw new BadRequestException(
        'Admin already exists, please proceed with login',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const accessToken = await this.adminService.createAdminUserTransactional(
      email,
      passwordHash,
      role,
      async (user) => {
        const token = await this.generateAccessToken(user);
        const tokenHash = this.hashToken(token);
        return { tokenHash, accessToken: token };
      },
    );
    return { email, accessToken };
  }

  async adminLogin(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.adminService.findAdminByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user);
    const tokenHash = this.hashToken(accessToken);
    await this.adminService.addSessionTokenHash(user.id, tokenHash);
    return { email, accessToken };
  }

  async validateAdminUserFromId(
    userId: string,
  ): Promise<AdminUsersEntity | null> {
    try {
      const adminUser = await this.adminService.findOne(userId);
      if (adminUser) {
        return adminUser;
      }
      return null;
    } catch (error: unknown) {
      this.logger.error('[AuthService.validateAdminUserFromId] error:', {
        error,
      });
      return null;
    }
  }

  private hashToken(token: string) {
    return createHash('md5').update(token).digest('hex');
  }
}
