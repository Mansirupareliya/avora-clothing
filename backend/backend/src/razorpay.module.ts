import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { RazorpayService } from './service/razorpay.service';
import { RazorpayController } from './controller/razorpay.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [RazorpayService],
  controllers: [RazorpayController],
  exports: [RazorpayService],
})
export class RazorpayModule {}
