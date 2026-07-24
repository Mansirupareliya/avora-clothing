import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReturnsService } from '../service/returns.service';
import { CreateReturnDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.returnsService.getAll(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(req.user.sub, dto);
  }
}
