import { Module } from '@nestjs/common';
import { DelhiveryService } from './service/delhivery.service';

@Module({
  providers: [DelhiveryService],
  exports: [DelhiveryService],
})
export class DelhiveryModule {}
