import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com', description: 'Foydalanuvchi elektron pochtasi' })
  @IsEmail({}, { message: 'Yaroqli elektron pochta kiriting' })
  @IsNotEmpty({ message: 'Email kiritish majburiy' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Maxfiy parol' })
  @IsString({ message: 'Parol satr bo\'lishi kerak' })
  @IsNotEmpty({ message: 'Parol kiritish majburiy' })
  @MinLength(6, { message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
  password: string;
}
