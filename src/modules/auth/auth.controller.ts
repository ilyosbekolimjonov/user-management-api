import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Tizimga kirish (Login)' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish va JWT token qaytadi.' })
  @ApiResponse({ status: 401, description: 'Email yoki parol noto\'g\'ri.' })
  @ApiResponse({ status: 403, description: 'Foydalanuvchi faol emas.' })
  login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.authService.login(loginDto, req);
  }
}
