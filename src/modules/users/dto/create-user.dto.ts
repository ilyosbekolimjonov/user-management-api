import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, Status } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Ism Familiya', description: 'To\'liq ism-sharifi' })
  @IsString({ message: 'Ism matn bo\'lishi kerak' })
  @IsNotEmpty({ message: 'Ism kiritish majburiy' })
  fullName: string;

  @ApiProperty({ example: 'name@example.com', description: 'Elektron pochta' })
  @IsEmail({}, { message: 'To\'g\'ri elektron pochta kiriting' })
  @IsNotEmpty({ message: 'Email kiritish majburiy' })
  email: string;

  @ApiProperty({ example: 'Q1w2e3r4!', description: 'Foydalanuvchi paroli' })
  @IsString()
  @IsNotEmpty({ message: 'Parol kiritish majburiy' })
  @MinLength(6, { message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' })
  password: string;

  @ApiProperty({ example: 'user', enum: Role, required: false })
  @IsEnum(Role, { message: 'Rol faqat admin yoki user bo\'lishi mumkin' })
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: 'active', enum: Status, required: false })
  @IsEnum(Status, { message: 'Status faqat active yoki inactive bo\'lishi mumkin' })
  @IsOptional()
  status?: Status;
}
