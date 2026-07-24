import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entity/order.entity';

import { ShoppingCreditsService } from './shopping-credits.service';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private shoppingCreditsService: ShoppingCreditsService,
  ) {}

  async onModuleInit() {
    await this.seedInitialOrdersIfEmpty();
  }

  // Seed sample initial customer orders if database is empty so Admin Orders page is rich out-of-the-box
  private async seedInitialOrdersIfEmpty() {
    const count = await this.orderRepo.count();
    if (count > 0) return;

    const sampleOrders = [
      {
        orderNumber: 1001,
        orderId: 'AVR-1001',
        totalAmount: 5899,
        status: 'confirmed' as OrderStatus,
        shippingAddress: {
          fullName: 'Rajesh Patel',
          phone: '9876543210',
          addressLine1: '45, Satellite Society, Ring Road',
          city: 'Surat',
          pincode: '395007',
          note: 'Deliver before 6 PM',
        },
        items: [
          { productId: 1, productName: 'Royal Silk Embroidered Kurta Set', price: 5899, quantity: 1, size: 'L' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      },
      {
        orderNumber: 1002,
        orderId: 'AVR-1002',
        totalAmount: 6450,
        status: 'shipped' as OrderStatus,
        shippingAddress: {
          fullName: 'Amit Sharma',
          phone: '9825012345',
          addressLine1: '12, CG Road, Navrangpura',
          city: 'Ahmedabad',
          pincode: '380009',
        },
        items: [
          { productId: 2, productName: 'Premium Cotton Slim Formal Shirt', price: 3225, quantity: 2, size: 'M' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 24 * 2),
      },
      {
        orderNumber: 1003,
        orderId: 'AVR-1003',
        totalAmount: 5450,
        status: 'pending' as OrderStatus,
        shippingAddress: {
          fullName: 'Jayesh Shah',
          phone: '9909988776',
          addressLine1: '88, Alkapuri',
          city: 'Vadodara',
          pincode: '390007',
        },
        items: [
          { productId: 3, productName: 'Classic Checkered Casual Shirt', price: 5450, quantity: 1, size: 'XL' }
        ],
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ];

    for (const ordData of sampleOrders) {
      const order = this.orderRepo.create(ordData);
      await this.orderRepo.save(order);
    }
  }

  async getAll(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOne(userId: string, id: string): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { id, userId } });
  }

  // Generate unique sequential order number starting from 1001
  async generateNextOrderNumber(): Promise<{ orderNumber: number; orderId: string }> {
    const maxOrder = await this.orderRepo
      .createQueryBuilder('o')
      .select('MAX(o.orderNumber)', 'maxNum')
      .getRawOne();

    const currentMax = maxOrder && maxOrder.maxNum ? parseInt(maxOrder.maxNum, 10) : 1000;
    const nextNum = currentMax + 1;
    const orderId = `AVR-${nextNum}`;

    return { orderNumber: nextNum, orderId };
  }

  // Create new customer order with unique sequential Order ID & process promotional credits
  async create(userId: string | undefined, data: any): Promise<Order & { unlockedCredit?: any }> {
    const { orderNumber, orderId } = await this.generateNextOrderNumber();
    const orderData: Partial<Order> = {
      ...data,
      userId,
      orderNumber,
      orderId,
      status: data.status || 'pending',
    };
    const order = this.orderRepo.create(orderData);
    const savedOrder: Order = await this.orderRepo.save(order);

    // If a shopping credit was applied, mark it as used
    if (data.appliedCreditId || data.appliedCreditCode) {
      const creditId = data.appliedCreditId || data.appliedCreditCode;
      try {
        await this.shoppingCreditsService.redeemCredit(creditId, savedOrder.orderId);
      } catch (err) {
        console.error('Failed to redeem applied credit:', err);
      }
    }

    // Check if order qualifies for automatic promotional credit based on active admin config
    let unlockedCredit: any = null;
    const qualifyingTotal = Number(data.originalSubtotal || savedOrder.totalAmount);
    try {
      unlockedCredit = await this.shoppingCreditsService.generateCreditForOrder(
        savedOrder.orderId,
        qualifyingTotal,
        userId,
        data.shippingAddress?.fullName || 'Valued Customer',
        data.userEmail || (userId ? `user_${userId}@avora.com` : undefined),
      );
    } catch (err) {
      console.error('Failed to generate unlocked promotional credit:', err);
    }

    return Object.assign(savedOrder, { unlockedCredit });
  }

  // Admin: Get all orders across store with filter & search
  async getAllAdminOrders(): Promise<Order[]> {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Admin: Update order status
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) return null;
    order.status = status;
    return this.orderRepo.save(order);
  }
}
