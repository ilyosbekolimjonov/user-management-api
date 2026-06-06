import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yo\'q yoki o\'chirilgan');
    }
    
    if (user.status === 'inactive') {
      throw new UnauthorizedException('Foydalanuvchi faol emas');
    }
    
    return user;
  }
}
