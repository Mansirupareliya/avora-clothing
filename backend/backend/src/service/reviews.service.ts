import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entity/reviews.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findAll(productId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      order: { date: 'DESC' },
    });
  }

  async create(reviewData: Partial<Review>): Promise<Review> {
    const review = this.reviewRepository.create(reviewData);
    return this.reviewRepository.save(review);
  }

  async findOne(id: number): Promise<Review | null> {
    return this.reviewRepository.findOne({ where: { id } });
  }

  async findAllGlobal(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: { product: true },
      order: { date: 'DESC' },
    });
  }

  async reply(id: number, adminReply: string): Promise<Review | null> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) return null;
    review.adminReply = adminReply;
    review.replyDate = new Date();
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
