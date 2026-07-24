import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from './entity/return.entity';
import { ReturnsService } from './service/returns.service';
import { ReturnsController } from './controller/returns.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Return]), JwtModule],
  providers: [ReturnsService],
  controllers: [ReturnsController],
})
export class ReturnsModule {}
