import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { CreateCartDto, UpdateCartDto } from '../dto/create-cart.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Req() req: any, @Body() createCartDto: CreateCartDto) {
    return this.cartService.addToCart(req.user.sub, createCartDto);
  }

  @Get()
  async getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.sub);
  }

  @Get(':id')
  async getCartItem(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.cartService.getCartItem(req.user.sub, id);
  }

  @Put(':id')
  async updateCart(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateCart(req.user.sub, id, updateCartDto);
  }

  @Delete(':id')
  async removeFromCart(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.cartService.removeFromCart(req.user.sub, id);
    return { message: 'Item removed from cart' };
  }

  @Delete()
  async clearCart(@Req() req: any) {
    await this.cartService.clearCart(req.user.sub);
    return { message: 'Cart cleared' };
  }
}
