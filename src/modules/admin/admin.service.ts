import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersEntity } from './entities/admin-users.entity';
import { AllowedAdminsEntity } from './entities/allowed-admins.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(AdminUsersEntity)
    private readonly adminUsersRepository: Repository<AdminUsersEntity>,
    @InjectRepository(AllowedAdminsEntity)
    private readonly allowedAdminsRepository: Repository<AllowedAdminsEntity>,
  ) {}

  findOne(id: string) {
    return this.adminUsersRepository.findOneBy({ id });
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
