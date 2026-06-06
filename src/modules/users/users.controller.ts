import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi foydalanuvchi yaratish' })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi yaratildi' })
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const currentUserId = req.user.id;
    return this.usersService.create(createUserDto, currentUserId, req);
  }

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchilar ro\'yxatini olish' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Ism yoki email bo\'yicha qidiruv' })
  @ApiQuery({ name: 'role', required: false, type: String, enum: ['admin', 'user'] })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['active', 'inactive'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll({ page, limit, search, role, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta foydalanuvchi ma\'lumotini olish' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlarini tahrirlash' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user.id;
    return this.usersService.update(id, updateUserDto, currentUserId, req);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Foydalanuvchi statusini o\'zgartirish' })
  @ApiParam({ name: 'id', type: Number })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user.id;
    return this.usersService.updateStatus(id, updateStatusDto, currentUserId, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Foydalanuvchini o\'chirish (Soft delete)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const currentUserId = req.user.id;
    return this.usersService.remove(id, currentUserId, req);
  }
}
