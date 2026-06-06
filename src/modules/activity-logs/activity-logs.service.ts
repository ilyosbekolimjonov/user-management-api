import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(data: {
    userId: number;
    activityType: string;
    description: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
  }) {
    return this.prisma.activity.create({
      data: {
        userId: data.userId,
        activityType: data.activityType,
        description: data.description,
        oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null,
        newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null,
        ipAddress: data.ipAddress || null,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: number;
    activityType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, userId, activityType, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = Number(userId);
    }

    if (activityType) {
      where.activityType = activityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, data] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
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
}
