import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { CreateCartDto, UpdateCartDto } from '../dto/create-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() createCartDto: CreateCartDto) {
    return this.cartService.addToCart(createCartDto);
  }

  @Get()
  async getCart() {
    return this.cartService.getCart();
  }

  @Get(':id')
  async getCartItem(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cartService.getCartItem(id);
  }

  @Put(':id')
  async updateCart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateCart(id, updateCartDto);
  }

  @Delete(':id')
  async removeFromCart(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.cartService.removeFromCart(id);
    return { message: 'Item removed from cart' };
  }

  @Delete()
  async clearCart() {
    await this.cartService.clearCart();
    return { message: 'Cart cleared' };
  }
}
