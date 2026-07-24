import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from '../service/wishlist.service';
import { CreateWishlistDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.wishlistService.getAll(req.user.sub);
  }

  @Post()
  add(@Req() req: any, @Body() dto: CreateWishlistDto) {
    return this.wishlistService.add(req.user.sub, dto);
  }

  @Delete(':productId')
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.sub, parseInt(productId));
  }

  @Get('check/:productId')
  check(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.isWishlisted(req.user.sub, parseInt(productId));
  }
}
