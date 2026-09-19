import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entity/offer.entity';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
  ) {}

  // ─── Public ──────────────────────────────────────────────────────────────

  async getActiveOffers(): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  async createOffer(data: Partial<Offer>): Promise<Offer> {
    if (!data.title) throw new BadRequestException('Offer title is required');
    const offer = this.offerRepo.create(data);
    return this.offerRepo.save(offer);
  }

  async getAllOffers(): Promise<Offer[]> {
    return this.offerRepo.find({ order: { displayOrder: 'ASC', createdAt: 'DESC' } });
  }

  async updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    Object.assign(offer, data);
    return this.offerRepo.save(offer);
  }

  async deleteOffer(id: string): Promise<{ success: boolean }> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    await this.offerRepo.remove(offer);
    return { success: true };
  }

  async toggleActive(id: string): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    offer.isActive = !offer.isActive;
    return this.offerRepo.save(offer);
  }
}
