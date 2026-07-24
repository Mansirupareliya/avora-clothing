import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from './entity/analytics.entity';
import { Product } from './entity/products.entity';
import { AnalyticsService } from './service/analytics.service';
import { AnalyticsController } from './controller/analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, Product])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
