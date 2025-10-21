import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersEntity } from './entities/admin-users.entity';
import { AllowedAdminsEntity } from './entities/allowed-admins.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUsersEntity, AllowedAdminsEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
