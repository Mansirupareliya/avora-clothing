import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return } from '../entity/return.entity';
import { CreateReturnDto } from '../dto/user.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepo: Repository<Return>,
  ) {}

  async getAll(userId: string): Promise<Return[]> {
    return this.returnRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateReturnDto): Promise<Return> {
    const ret = this.returnRepo.create({ ...dto, userId });
    return this.returnRepo.save(ret);
  }
}
