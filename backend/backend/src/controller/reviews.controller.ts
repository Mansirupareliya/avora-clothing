import { Body, Controller, Get, Param, Post, Patch, Delete, ParseIntPipe } from '@nestjs/common';
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

@Controller('reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAllGlobal() {
    return this.reviewsService.findAllGlobal();
  }

  @Patch(':id/reply')
  reply(@Param('id', ParseIntPipe) id: number, @Body() body: { reply: string }) {
    return this.reviewsService.reply(id, body.reply);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
