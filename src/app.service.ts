import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dbConnection: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkServiceHealth(): Promise<{ status: string; message: string }> {
    await this.dbConnection.query('SELECT now()');
    return { status: 'ok', message: 'healthy' };
  }
}
