import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UpdateProfileDto, ChangePasswordDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.sub);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  @Patch('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.sub, dto);
  }
}
