import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly activityLogsService: ActivityLogsService,
    ) { }

    async login(loginDto: LoginDto, req: Request) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.isDeleted) {
            throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
        }
        if (user.status === 'inactive') {
            throw new ForbiddenException('Foydalanuvchi faol holatda emas');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const ipAddress = (req.ip || req.connection?.remoteAddress || '').toString();
        await this.activityLogsService.logAction({
            userId: user.id,
            activityType: 'login',
            description: 'Foydalanuvchi tizimga kirdi',
            ipAddress,
        });

        const payload = { sub: user.id, email: user.email, role: user.role };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        };
    }
}
