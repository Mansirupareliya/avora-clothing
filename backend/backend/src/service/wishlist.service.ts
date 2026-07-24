import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entity/wishlist.entity';
import { CreateWishlistDto } from '../dto/user.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
  ) {}

  async getAll(userId: string): Promise<Wishlist[]> {
    return this.wishlistRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, dto: CreateWishlistDto): Promise<Wishlist> {
    // Prevent duplicates
    const existing = await this.wishlistRepo.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) return existing;

    const item = this.wishlistRepo.create({ ...dto, userId });
    return this.wishlistRepo.save(item);
  }

  async remove(userId: string, productId: number): Promise<void> {
    await this.wishlistRepo.delete({ userId, productId });
  }

  async isWishlisted(userId: string, productId: number): Promise<boolean> {
    const item = await this.wishlistRepo.findOne({ where: { userId, productId } });
    return !!item;
  }
}
