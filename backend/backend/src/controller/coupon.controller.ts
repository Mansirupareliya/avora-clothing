import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { CouponService } from '../service/coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ─── Admin Routes ─────────────────────────────────────────────────────────

  @Post('admin')
  createCoupon(@Body() body: any) {
    return this.couponService.createCoupon(body);
  }

  @Get('admin')
  getAllCoupons() {
    return this.couponService.getAllCoupons();
  }

  @Patch('admin/:id')
  updateCoupon(@Param('id') id: string, @Body() body: any) {
    return this.couponService.updateCoupon(id, body);
  }

  @Delete('admin/:id')
  deleteCoupon(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  @Patch('admin/:id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.couponService.toggleActive(id);
  }

  @Get('admin/:id/stats')
  getCouponStats(@Param('id') id: string) {
    return this.couponService.getCouponStats(id);
  }

  // ─── Public Routes ──────────────────────────────────────────────────────────

  @Get('featured')
  getFeaturedCoupon() {
    return this.couponService.getFeaturedCoupon();
  }

  // ─── User Routes ──────────────────────────────────────────────────────────

  @Post('validate')
  validateCoupon(
    @Body() body: { code: string; orderTotal: number; userId?: string; userEmail?: string },
  ) {
    return this.couponService.validateCoupon(
      body.code,
      Number(body.orderTotal),
      body.userId,
      body.userEmail,
    );
  }

  @Post('apply')
  applyCoupon(
    @Body()
    body: {
      code: string;
      orderId: string;
      discountApplied: number;
      userId?: string;
      userEmail?: string;
    },
  ) {
    return this.couponService.applyCoupon(
      body.code,
      body.orderId,
      Number(body.discountApplied),
      body.userId,
      body.userEmail,
    );
  }
}
