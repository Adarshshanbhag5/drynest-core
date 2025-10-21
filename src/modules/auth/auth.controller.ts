import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  AdminLoginDto,
  AdminSignupDto,
  AuthResponseDto,
} from './dto/auth.dto.js';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator.js';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin-signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AuthResponseDto,
  })
  async adminSignup(@Body() body: AdminSignupDto) {
    const { email, password, role } = body;
    return this.authService.adminSignup(email, role, password);
  }

  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthResponseDto,
  })
  async adminLogin(@Body() body: AdminLoginDto) {
    const { email, password } = body;
    return this.authService.adminLogin(email, password);
  }
}
