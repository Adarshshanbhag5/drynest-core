import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsersEntity } from '../admin/entities/admin-users.entity';
import { AllowedAdminsEntity } from '../admin/entities/allowed-admins.entity';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AdminModule } from '../admin/admin.module.js';
import { AuthConfig } from 'src/config/auth.config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    AdminModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfig = configService.get<AuthConfig>('authConfig');
        if (!authConfig) {
          throw new Error('Auth config not found');
        }
        return {
          secret: authConfig.jwtSecret,
          signOptions: {
            expiresIn: '2d',
          },
        };
      },
    }),
    TypeOrmModule.forFeature([AdminUsersEntity, AllowedAdminsEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
