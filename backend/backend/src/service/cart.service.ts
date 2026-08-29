import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entity/cart.entity';
import { CreateCartDto, UpdateCartDto } from '../dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async addToCart(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
    // Check if product with same size already exists in cart
    // Build where clause without assigning null to 'size' (TypeORM expects string|undefined)
    const where: any = { userId, productId: createCartDto.productId };
    if (createCartDto.size) where.size = createCartDto.size;

    const existingItem = await this.cartRepository.findOne({ where });

    if (existingItem) {
      // Update quantity if already exists
      existingItem.quantity += createCartDto.quantity;
      return this.cartRepository.save(existingItem);
    }

    // Create new cart item
    const cartItem = this.cartRepository.create({ ...createCartDto, userId });
    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCartItem(userId: string, id: string): Promise<Cart> {
    const item = await this.cartRepository.findOne({ where: { id, userId } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    return item;
  }

  async updateCart(userId: string, id: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    const item = await this.getCartItem(userId, id);
    Object.assign(item, updateCartDto);
    return this.cartRepository.save(item);
  }

  async removeFromCart(userId: string, id: string): Promise<void> {
    const item = await this.getCartItem(userId, id);
    await this.cartRepository.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}
