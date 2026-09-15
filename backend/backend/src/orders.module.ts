import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Return } from './entity/return.entity';
import { OrdersService } from './service/orders.service';
import { OrdersController } from './controller/orders.controller';
import { JwtModule } from '@nestjs/jwt';

import { ShoppingCreditsModule } from './shopping-credits.module';
import { DelhiveryModule } from './delhivery.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Return]), JwtModule, ShoppingCreditsModule, DelhiveryModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
