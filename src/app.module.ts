import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbConnections } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ...Object.values(DbConnections()).map((connection) =>
      TypeOrmModule.forRoot(connection),
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
