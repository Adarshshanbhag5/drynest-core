import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  AddAllowedAdminDto,
  AddAllowedAdminResponseDto,
  DeleteAllowedAdminDto,
  DeleteAllowedAdminResponseDto,
} from './dto/admin.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findOne(@Query('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Post('add-allowed-admin')
  @ApiResponse({
    status: HttpStatus.OK,
    type: AddAllowedAdminResponseDto,
  })
  addAllowedAdmin(@Body() body: AddAllowedAdminDto) {
    return this.adminService.addAllowedAdmin(body.email);
  }

  @Delete('allowed-admin')
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteAllowedAdminResponseDto,
  })
  deleteAllowedAdmin(@Body() body: DeleteAllowedAdminDto) {
    return this.adminService.deleteAllowedAdmin(body.email);
  }
}
