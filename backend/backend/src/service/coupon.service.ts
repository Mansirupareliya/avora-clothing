import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entity/coupon.entity';
import { CouponUsage } from '../entity/coupon-usage.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private usageRepo: Repository<CouponUsage>,
  ) {}

  // ─── Admin ───────────────────────────────────────────────────────────────────

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    if (!data.code) throw new BadRequestException('Coupon code is required');
    data.code = String(data.code).toUpperCase().trim();
    const existing = await this.couponRepo.findOne({ where: { code: data.code } });
    if (existing) throw new BadRequestException('Coupon code already exists');
    const coupon = this.couponRepo.create(data);
    return this.couponRepo.save(coupon);
  }

  async getAllCoupons(): Promise<(Coupon & { usageCount: number })[]> {
    const coupons = await this.couponRepo.find({ order: { createdAt: 'DESC' } });
    return Promise.all(
      coupons.map(async (c) => {
        const usageCount = await this.usageRepo.count({ where: { couponId: c.id } });
        return { ...c, usageCount };
      }),
    );
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (data.code) data.code = String(data.code).toUpperCase().trim();
    Object.assign(coupon, data);
    return this.couponRepo.save(coupon);
  }

  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponRepo.remove(coupon);
    return { success: true };
  }

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = !coupon.isActive;
    return this.couponRepo.save(coupon);
  }

  // ─── User ─────────────────────────────────────────────────────────────────────

  async validateCoupon(
    code: string,
    orderTotal: number,
    userId?: string,
    userEmail?: string,
  ): Promise<{
    valid: boolean;
    discountAmount: number;
    coupon?: Coupon;
    message: string;
  }> {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
    if (!coupon.isActive) return { valid: false, discountAmount: 0, message: 'This coupon is no longer active' };

    // Expiry check
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired' };
    }

    // Min order check
    if (orderTotal < Number(coupon.minOrderValue || 0)) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order value ₹${Number(coupon.minOrderValue).toLocaleString()} required for this coupon`,
      };
    }

    // Global usage limit check
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'This coupon has reached its usage limit' };
    }

    // Per-user usage limit check
    if (userId || userEmail) {
      const userUsageQuery = this.usageRepo.createQueryBuilder('u').where('u.couponId = :couponId', { couponId: coupon.id });
      if (userId && userEmail) {
        userUsageQuery.andWhere('(u.userId = :userId OR u.userEmail = :userEmail)', { userId, userEmail });
      } else if (userId) {
        userUsageQuery.andWhere('u.userId = :userId', { userId });
      } else if (userEmail) {
        userUsageQuery.andWhere('u.userEmail = :userEmail', { userEmail });
      }
      const userUsageCount = await userUsageQuery.getCount();
      if (userUsageCount >= (coupon.perUserLimit || 1)) {
        return { valid: false, discountAmount: 0, message: 'You have already used this coupon' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount != null) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }
    discountAmount = Math.min(discountAmount, orderTotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      discountAmount,
      coupon,
      message: `✅ Coupon applied! You save ₹${discountAmount.toLocaleString()}`,
    };
  }

  async applyCoupon(
    code: string,
    orderId: string,
    discountApplied: number,
    userId?: string,
    userEmail?: string,
  ): Promise<void> {
    const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase().trim() } });
    if (!coupon) return;

    // Increment used count
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    await this.couponRepo.save(coupon);

    // Record usage
    const usage = this.usageRepo.create({
      couponId: coupon.id,
      couponCode: coupon.code,
      userId,
      userEmail,
      orderId,
      discountApplied,
    });
    await this.usageRepo.save(usage);
  }

  async getCouponStats(id: string) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    const usages = await this.usageRepo.find({ where: { couponId: id }, order: { usedAt: 'DESC' } });
    const totalDiscount = usages.reduce((s, u) => s + Number(u.discountApplied || 0), 0);
    return { coupon, usages, totalDiscount };
  }
}
