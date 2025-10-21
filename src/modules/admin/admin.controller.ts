import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findOne(@Query('id') id: string) {
    return this.adminService.findOne(id);
  }
}
