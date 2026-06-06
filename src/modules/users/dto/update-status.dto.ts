import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ example: 'inactive', enum: Status, description: 'Foydalanuvchining yangi statusi' })
  @IsEnum(Status, { message: 'Status faqat active yoki inactive bo\'lishi mumkin' })
  @IsNotEmpty({ message: 'Status kiritish majburiy' })
  status: Status;
}
