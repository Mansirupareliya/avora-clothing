import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrdersService } from './service/orders.service';
import { OrdersController } from './controller/orders.controller';
import { JwtModule } from '@nestjs/jwt';

import { ShoppingCreditsModule } from './shopping-credits.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), JwtModule, ShoppingCreditsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
