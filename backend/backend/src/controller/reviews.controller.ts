import { Body, Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from '../service/reviews.service';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findAll(productId);
  }

  @Post()
  create(@Param('productId', ParseIntPipe) productId: number, @Body() body: any) {
    return this.reviewsService.create({
      ...body,
      productId,
    });
  }
}
