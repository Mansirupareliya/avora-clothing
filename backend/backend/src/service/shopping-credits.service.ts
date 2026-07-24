import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCredit, CreditStatus } from '../entity/shopping-credit.entity';
import { Order } from '../entity/order.entity';
import { PromotionalConfig } from '../entity/promotional-config.entity';

@Injectable()
export class ShoppingCreditsService implements OnModuleInit {
  constructor(
    @InjectRepository(ShoppingCredit)
    private creditRepo: Repository<ShoppingCredit>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(PromotionalConfig)
    private configRepo: Repository<PromotionalConfig>,
  ) {}

  async onModuleInit() {
    await this.getPromotionalConfig();
    await this.seedInitialCreditsIfEmpty();
  }

  // Get active promotional offer configuration
  async getPromotionalConfig(): Promise<PromotionalConfig> {
    const existing = await this.configRepo.findOne({
      where: {},
      order: { updatedAt: 'DESC' },
    });
    if (existing) return existing;

    const defaultConfig = this.configRepo.create({
      minTriggerSpend: 5000,
      rewardAmount: 1500,
      minRedeemOrderValue: 6000,
      expiryDays: 30,
      isEnabled: true,
      offerTitle: '₹1,500 Shopping Credit on ₹5,000+ Orders',
    });
    return this.configRepo.save(defaultConfig);
  }

  // Update promotional offer configuration from Admin
  async updatePromotionalConfig(data: Partial<PromotionalConfig>): Promise<PromotionalConfig> {
    let config = await this.getPromotionalConfig();
    Object.assign(config, data);
    return this.configRepo.save(config);
  }

  private async seedInitialCreditsIfEmpty() {
    const count = await this.creditRepo.count();
    if (count > 0) return;

    const now = new Date();
    const expiry30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiredPast = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const sampleCredits: Partial<ShoppingCredit>[] = [
      {
        code: 'SC-891204',
        userName: 'Rajesh Patel',
        userEmail: 'rajesh.patel@example.com',
        userId: 'sample-user-1',
        amount: 1500,
        minOrderValue: 6000,
        status: 'active' as CreditStatus,
        expiresAt: expiry30Days,
        originOrderId: 'AVR-1001',
        issuedBy: 'system',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'SC-742910',
        userName: 'Amit Sharma',
        userEmail: 'amit.sharma@example.com',
        userId: 'sample-user-2',
        amount: 1500,
        minOrderValue: 6000,
        status: 'used' as CreditStatus,
        expiresAt: expiry30Days,
        originOrderId: 'AVR-1002',
        usedOrderId: 'AVR-1004',
        usedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        issuedBy: 'system',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'SC-512039',
        userName: 'Priya Verma',
        userEmail: 'priya.v@example.com',
        amount: 1500,
        minOrderValue: 6000,
        status: 'expired' as CreditStatus,
        expiresAt: expiredPast,
        originOrderId: 'AVR-0988',
        issuedBy: 'system',
        createdAt: new Date(now.getTime() - 36 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'SC-991283',
        userName: 'Karan Mehta',
        userEmail: 'karan.m@example.com',
        amount: 1500,
        minOrderValue: 6000,
        status: 'active' as CreditStatus,
        expiresAt: expiry30Days,
        issuedBy: 'admin',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const data of sampleCredits) {
      const c = this.creditRepo.create(data);
      await this.creditRepo.save(c);
    }
  }

  // Generate unique code SC-XXXXXX
  private generateCode(): string {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `SC-${rand}`;
  }

  // Auto update expired credits
  private async autoUpdateExpired() {
    const now = new Date();
    await this.creditRepo
      .createQueryBuilder()
      .update(ShoppingCredit)
      .set({ status: 'expired' })
      .where('expiresAt < :now AND status = :status', { now, status: 'active' })
      .execute();
  }

  // Generate credit when customer places order based on dynamic admin offer configuration
  async generateCreditForOrder(
    orderId: string,
    orderTotal: number,
    userId?: string,
    userName?: string,
    userEmail?: string,
  ): Promise<ShoppingCredit | null> {
    const config = await this.getPromotionalConfig();
    if (!config.isEnabled) return null;

    const minTrigger = Number(config.minTriggerSpend || 5000);
    if (orderTotal < minTrigger) return null;

    const rewardAmt = Number(config.rewardAmount || 1500);
    const minRedeem = Number(config.minRedeemOrderValue || 6000);
    const days = Number(config.expiryDays || 30);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const code = this.generateCode();

    const credit = this.creditRepo.create({
      code,
      userId,
      userName: userName || 'Valued Customer',
      userEmail,
      amount: rewardAmt,
      minOrderValue: minRedeem,
      status: 'active',
      expiresAt,
      originOrderId: orderId,
      issuedBy: 'system',
    });

    return this.creditRepo.save(credit);
  }

  // Get credits for user
  async getUserCredits(userId?: string, userEmail?: string): Promise<ShoppingCredit[]> {
    await this.autoUpdateExpired();

    const query = this.creditRepo.createQueryBuilder('c');
    if (userId && userEmail) {
      query.where('c.userId = :userId OR c.userEmail = :userEmail', { userId, userEmail });
    } else if (userId) {
      query.where('c.userId = :userId', { userId });
    } else if (userEmail) {
      query.where('c.userEmail = :userEmail', { userEmail });
    } else {
      return [];
    }

    return query.orderBy('c.createdAt', 'DESC').getMany();
  }

  // Get active valid credit available for checkout
  async getActiveCreditForUser(userId?: string, userEmail?: string): Promise<ShoppingCredit | null> {
    await this.autoUpdateExpired();

    const credits = await this.getUserCredits(userId, userEmail);
    const active = credits.find((c) => c.status === 'active' && new Date(c.expiresAt) > new Date());
    return active || null;
  }

  // Mark credit as used during checkout
  async redeemCredit(creditIdOrCode: string, usedOrderId: string): Promise<ShoppingCredit | null> {
    const credit = await this.creditRepo.findOne({
      where: [{ id: creditIdOrCode }, { code: creditIdOrCode }],
    });

    if (!credit) return null;
    if (credit.status !== 'active' || new Date(credit.expiresAt) < new Date()) {
      throw new Error('Shopping Credit is no longer active or has expired');
    }

    credit.status = 'used';
    credit.usedOrderId = usedOrderId;
    credit.usedAt = new Date();
    return this.creditRepo.save(credit);
  }

  // Admin: Get all promotional credits with search & status filter
  async getAllAdminCredits(search?: string, statusFilter?: string): Promise<ShoppingCredit[]> {
    await this.autoUpdateExpired();

    const query = this.creditRepo.createQueryBuilder('c');

    if (statusFilter && statusFilter !== 'all') {
      query.andWhere('c.status = :status', { status: statusFilter });
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(c.code) LIKE :term OR LOWER(c.userName) LIKE :term OR LOWER(c.userEmail) LIKE :term OR LOWER(c.originOrderId) LIKE :term)',
        { term },
      );
    }

    return query.orderBy('c.createdAt', 'DESC').getMany();
  }

  // Admin: Manually issue shopping credit to customer
  async createManualCredit(data: {
    userName: string;
    userEmail: string;
    userId?: string;
    amount?: number;
    minOrderValue?: number;
    expiryDays?: number;
  }): Promise<ShoppingCredit> {
    const expiryDays = data.expiryDays || 30;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    const code = this.generateCode();

    const credit = this.creditRepo.create({
      code,
      userName: data.userName,
      userEmail: data.userEmail,
      userId: data.userId,
      amount: data.amount || 2000,
      minOrderValue: data.minOrderValue || 6000,
      status: 'active',
      expiresAt,
      issuedBy: 'admin',
    });

    return this.creditRepo.save(credit);
  }

  // Admin: Cancel credit
  async cancelCredit(id: string): Promise<ShoppingCredit | null> {
    const credit = await this.creditRepo.findOne({ where: { id } });
    if (!credit) return null;
    credit.status = 'cancelled';
    return this.creditRepo.save(credit);
  }

  // Admin Analytics computation
  async getAnalytics(): Promise<{
    creditsIssuedCount: number;
    creditsIssuedAmount: number;
    creditsRedeemedCount: number;
    creditsRedeemedAmount: number;
    revenueGenerated: number;
    repeatCustomerRate: number;
  }> {
    await this.autoUpdateExpired();

    const allCredits = await this.creditRepo.find();
    const allOrders = await this.orderRepo.find();

    const creditsIssuedCount = allCredits.length;
    const creditsIssuedAmount = allCredits.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const redeemed = allCredits.filter((c) => c.status === 'used');
    const creditsRedeemedCount = redeemed.length;
    const creditsRedeemedAmount = redeemed.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    // Calculate revenue from orders where credit was redeemed
    const redeemedOrderIds = new Set(redeemed.map((c) => c.usedOrderId).filter(Boolean));
    const ordersWithRedeemedCredit = allOrders.filter(
      (o) => redeemedOrderIds.has(o.orderId) || redeemedOrderIds.has(o.id),
    );

    const revenueGenerated = ordersWithRedeemedCredit.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );

    // Repeat customer rate calculation
    const userOrderCounts = new Map<string, number>();
    allOrders.forEach((o) => {
      const key = o.userId || o.shippingAddress?.phone || o.shippingAddress?.fullName;
      if (key) {
        userOrderCounts.set(key, (userOrderCounts.get(key) || 0) + 1);
      }
    });

    let totalCustomers = userOrderCounts.size;
    let repeatCustomers = 0;
    userOrderCounts.forEach((cnt) => {
      if (cnt > 1) repeatCustomers++;
    });

    // Fallback if no user IDs present in orders
    if (totalCustomers === 0) {
      totalCustomers = Math.max(creditsIssuedCount, 1);
      repeatCustomers = creditsRedeemedCount;
    }

    const repeatCustomerRate = Math.min(
      100,
      Math.round((repeatCustomers / Math.max(totalCustomers, 1)) * 100),
    );

    return {
      creditsIssuedCount,
      creditsIssuedAmount,
      creditsRedeemedCount,
      creditsRedeemedAmount,
      revenueGenerated,
      repeatCustomerRate,
    };
  }
}
