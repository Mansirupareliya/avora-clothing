import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entity/address.entity';
import { CreateAddressDto, UpdateAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  async getAll(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    // If new address is default, unset existing default
    if (dto.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }
    const address = this.addressRepo.create({ ...dto, userId });
    return this.addressRepo.save(address);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.remove(address);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepo.save(address);
  }
}
