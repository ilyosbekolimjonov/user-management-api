import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, currentUserId: number, req: Request) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Bu elektron pochta orqali allaqachon ro\'yxatdan o\'tilgan');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.activityLogsService.logAction({
      userId: currentUserId,
      activityType: 'user_create',
      description: `Yangi foydalanuvchi yaratildi: ${newUser.email}`,
      newValues: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
      ipAddress: (req.ip || '').toString(),
    });

    const { password, ...result } = newUser;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUserEmail) {
        throw new BadRequestException('Bu elektron pochta band');
      }
    }

    const dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const oldValues: any = { ...user };
    const newValues: any = { ...updatedUser };
    delete oldValues.password;
    delete newValues.password;

    await this.activityLogsService.logAction({
      userId: currentUserId,
      activityType: 'user_update',
      description: `Foydalanuvchi ma'lumotlari tahrirlandi: ${user.email}`,
      oldValues,
      newValues,
      ipAddress: (req.ip || req.connection?.remoteAddress || '').toString(),
    });

    return { message: 'Foydalanuvchi muvaffaqiyatli yangilandi' };
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto, currentUserId: number, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });

    await this.activityLogsService.logAction({
      userId: currentUserId,
      activityType: 'status_change',
      description: `Foydalanuvchi statusi o'zgardi: ${user.email}`,
      oldValues: { status: user.status },
      newValues: { status: updatedUser.status },
      ipAddress: (req.ip || req.connection?.remoteAddress || '').toString(),
    });

    return { message: 'Foydalanuvchi statusi yangilandi' };
  }

  async remove(id: number, currentUserId: number, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    await this.activityLogsService.logAction({
      userId: currentUserId,
      activityType: 'user_delete',
      description: `Foydalanuvchi o'chirildi (soft delete): ${user.email}`,
      oldValues: { id: user.id },
      ipAddress: (req.ip || req.connection?.remoteAddress || '').toString(),
    });

    return { message: 'Foydalanuvchi o\'chirildi' };
  }
}
