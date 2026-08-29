import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { CouponUsage } from './entity/coupon-usage.entity';
import { CouponService } from './service/coupon.service';
import { CouponController } from './controller/coupon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponUsage])],
  providers: [CouponService],
  controllers: [CouponController],
  exports: [CouponService],
})
export class CouponModule {}
