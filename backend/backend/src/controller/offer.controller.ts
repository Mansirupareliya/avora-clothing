import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { OfferService } from '../service/offer.service';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  // ─── Public Route — powers the live offers strip on the store page ────────

  @Get()
  getActiveOffers() {
    return this.offerService.getActiveOffers();
  }

  // ─── Admin Routes ───────────────────────────────────────────────────────────

  @Get('admin')
  getAllOffers() {
    return this.offerService.getAllOffers();
  }

  @Post('admin')
  createOffer(@Body() body: any) {
    return this.offerService.createOffer(body);
  }

  @Patch('admin/:id')
  updateOffer(@Param('id') id: string, @Body() body: any) {
    return this.offerService.updateOffer(id, body);
  }

  @Delete('admin/:id')
  deleteOffer(@Param('id') id: string) {
    return this.offerService.deleteOffer(id);
  }

  @Patch('admin/:id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.offerService.toggleActive(id);
  }
}
