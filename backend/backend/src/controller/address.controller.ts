import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AddressService } from '../service/address.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.addressService.getAll(req.user.sub);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.sub, dto);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.addressService.remove(req.user.sub, id);
  }

  @Patch(':id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.addressService.setDefault(req.user.sub, id);
  }
}
