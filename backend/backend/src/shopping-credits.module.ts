import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCredit } from './entity/shopping-credit.entity';
import { Order } from './entity/order.entity';
import { PromotionalConfig } from './entity/promotional-config.entity';
import { ShoppingCreditsService } from './service/shopping-credits.service';
import { ShoppingCreditsController } from './controller/shopping-credits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCredit, Order, PromotionalConfig])],
  providers: [ShoppingCreditsService],
  controllers: [ShoppingCreditsController],
  exports: [ShoppingCreditsService],
})
export class ShoppingCreditsModule {}
