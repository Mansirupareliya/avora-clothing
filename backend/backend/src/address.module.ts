import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entity/address.entity';
import { AddressService } from './service/address.service';
import { AddressController } from './controller/address.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), JwtModule],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
