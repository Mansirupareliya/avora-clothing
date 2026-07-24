import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController, AdminReviewsController } from './controller/reviews.controller';
import { ReviewsService } from './service/reviews.service';
import { Review } from './entity/reviews.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
