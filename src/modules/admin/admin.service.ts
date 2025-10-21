import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersEntity } from './entities/admin-users.entity';
import { AllowedAdminsEntity } from './entities/allowed-admins.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AdminUserRole } from 'src/shared/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(AdminUsersEntity)
    private readonly adminUsersRepository: Repository<AdminUsersEntity>,
    @InjectRepository(AllowedAdminsEntity)
    private readonly allowedAdminsRepository: Repository<AllowedAdminsEntity>,
  ) {}

  findOne(id: string) {
    return this.adminUsersRepository.findOneBy({ id });
  }

  async findAdminByEmail(email: string) {
    try {
      return this.adminUsersRepository.findOneBy({ email });
    } catch (error: unknown) {
      this.logger.error('[AdminService.findAdminByEmail] error:', { error });
      throw error;
    }
  }

  async addSessionTokenHash(
    userId: string,
    tokenHash: string,
    maxSessions = 3,
  ) {
    try {
      const user = await this.findOne(userId);
      if (!user) return;
      const tokens = Array.isArray(user.tokens) ? [...user.tokens] : [];
      tokens.push(tokenHash);
      while (tokens.length > maxSessions) {
        tokens.shift();
      }
      user.tokens = tokens;
      await this.adminUsersRepository.save(user);
    } catch (error: unknown) {
      this.logger.error('[AdminService.addSessionTokenHash] error:', { error });
      throw error;
    }
  }

  async createAdminUserTransactional(
    email: string,
    passwordHash: string,
    role: string,
    afterCreate: (
      user: AdminUsersEntity,
    ) => Promise<{ tokenHash: string; accessToken: string }>,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repo = queryRunner.manager.getRepository(AdminUsersEntity);
      const user = repo.create({
        email,
        passwordHash,
        role: role ?? AdminUserRole.ADMIN,
      });
      await repo.save(user);

      const { tokenHash, accessToken } = await afterCreate(user);

      const tokens = Array.isArray(user.tokens) ? [...user.tokens] : [];
      tokens.push(tokenHash);
      while (tokens.length > 3) tokens.shift();
      user.tokens = tokens;
      await repo.save(user);

      await queryRunner.commitTransaction();
      return accessToken;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error('[AdminService.createAdminUserTransactional] error:', {
        error,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllowedAdminByEmail(email: string) {
    return this.allowedAdminsRepository.findOneBy({ email });
  }

  async addAllowedAdmin(email: string) {
    const isExistingAllowedAdmin = await this.getAllowedAdminByEmail(email);
    if (isExistingAllowedAdmin) {
      throw new ConflictException('Allowed admin already exists');
    }

    try {
      const allowedAdmin = this.allowedAdminsRepository.create({ email });
      await this.allowedAdminsRepository.save(allowedAdmin);
      return { message: 'Email added to allowed admins successfully' };
    } catch (error: unknown) {
      this.logger.error('[AdminService.addAllowedAdmin] error:', { error });
      throw error;
    }
  }

  async deleteAdminUser(email: string) {
    try {
      const adminUser = await this.adminUsersRepository.findOneBy({ email });
      if (!adminUser) {
        throw new NotFoundException('Admin user not found!');
      }
      await this.adminUsersRepository.delete(adminUser.id);
      return { message: 'Admin user deleted successfully' };
    } catch (error: unknown) {
      this.logger.error('[AdminService.deleteAdminUser] error:', { error });
      throw error;
    }
  }

  async deleteAllowedAdmin(email: string) {
    const allowedAdmin = await this.getAllowedAdminByEmail(email);
    if (!allowedAdmin) {
      throw new NotFoundException('Allowed admin not found!');
    }
    try {
      await this.deleteAdminUser(email);
      await this.allowedAdminsRepository.delete(allowedAdmin.id);
      return { message: 'Allowed admin deleted successfully' };
    } catch (error: unknown) {
      this.logger.error('[AdminService.deleteAllowedAdmin] error:', { error });
      throw error;
    }
  }
}
