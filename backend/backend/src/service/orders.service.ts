import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderStatus, TrackingEvent } from '../entity/order.entity';
import { Return } from '../entity/return.entity';

import { ShoppingCreditsService } from './shopping-credits.service';
import { DelhiveryService } from './delhivery.service';

// Human-readable labels for each status milestone shown on tracking timeline
const STATUS_LABELS: Record<OrderStatus, { message: string; location?: string }> = {
  pending:          { message: 'Order placed successfully. Awaiting confirmation.' },
  confirmed:        { message: 'Your order has been confirmed by Avora.' },
  packed:           { message: 'Your order has been packed and is ready for pickup.', location: 'Avora Warehouse' },
  dispatched:       { message: 'Picked up by Delivery Limited. Your package is on its way!', location: 'Origin Hub' },
  out_for_delivery: { message: 'Your package is out for delivery. Expect it today!', location: 'Local Delivery Hub' },
  delivered:        { message: 'Package delivered successfully. Enjoy your purchase!', location: 'Delivery Address' },
  rto:              { message: 'Package could not be delivered and is being returned to origin (RTO).' },
  cancelled:        { message: 'Order has been cancelled.' },
};

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Return)
    private returnRepo: Repository<Return>,
    private shoppingCreditsService: ShoppingCreditsService,
    private delhiveryService: DelhiveryService,
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
        courierPartner: 'Delivery Limited',
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
        trackingHistory: [
          {
            status: 'pending' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 24 * 3 - 3600000 * 2).toISOString(),
            message: 'Order placed successfully. Awaiting confirmation.',
          },
          {
            status: 'confirmed' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
            message: 'Your order has been confirmed by Avora.',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      },
      {
        orderNumber: 1002,
        orderId: 'AVR-1002',
        totalAmount: 6450,
        status: 'out_for_delivery' as OrderStatus,
        awbNumber: 'DL2026100200',
        courierPartner: 'Delivery Limited',
        estimatedDelivery: new Date(Date.now() + 3600000 * 6),
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
        trackingHistory: [
          {
            status: 'pending' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 24 * 2 - 3600000 * 4).toISOString(),
            message: 'Order placed successfully. Awaiting confirmation.',
          },
          {
            status: 'confirmed' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 24 * 2 - 3600000 * 2).toISOString(),
            message: 'Your order has been confirmed by Avora.',
          },
          {
            status: 'packed' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            message: 'Your order has been packed and is ready for pickup.',
            location: 'Avora Warehouse',
          },
          {
            status: 'dispatched' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            message: 'Picked up by Delivery Limited. Your package is on its way!',
            location: 'Surat Origin Hub',
          },
          {
            status: 'out_for_delivery' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            message: 'Your package is out for delivery. Expect it today!',
            location: 'Ahmedabad Local Hub',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 24 * 2),
      },
      {
        orderNumber: 1003,
        orderId: 'AVR-1003',
        totalAmount: 5450,
        status: 'pending' as OrderStatus,
        courierPartner: 'Delivery Limited',
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
        trackingHistory: [
          {
            status: 'pending' as OrderStatus,
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            message: 'Order placed successfully. Awaiting confirmation.',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ];

    for (const ordData of sampleOrders) {
      const order = this.orderRepo.create(ordData as any);
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

    // Auto-append first tracking event: Order Placed
    const initialTracking: TrackingEvent = {
      status: 'pending',
      timestamp: new Date().toISOString(),
      message: STATUS_LABELS['pending'].message,
    };

    const orderData: Partial<Order> = {
      ...data,
      userId,
      orderNumber,
      orderId,
      courierPartner: 'Delivery Limited',
      status: data.status || 'pending',
      trackingHistory: [initialTracking],
    };
    const order = this.orderRepo.create(orderData);
    const savedOrder: Order = await this.orderRepo.save(order);

    // ─── Hand the order over to Delhivery ────────────────────────────────────
    // Fire-and-forget: never block checkout if Delhivery is unreachable or
    // not configured yet (DELHIVERY_API_TOKEN missing). Failures are logged
    // and the order simply stays with no AWB until an admin retries manually
    // via POST /orders/:id/delhivery/sync.
    if (process.env.DELHIVERY_API_TOKEN) {
      try {
        const { waybill } = await this.delhiveryService.createOrder(savedOrder);
        savedOrder.awbNumber = waybill;
        savedOrder.courierPartner = 'Delhivery';
        savedOrder.trackingHistory = [
          ...(savedOrder.trackingHistory || []),
          {
            status: savedOrder.status,
            timestamp: new Date().toISOString(),
            message: `Shipment created with Delhivery. AWB: ${waybill}`,
          },
        ];
        await this.orderRepo.save(savedOrder);
      } catch (err) {
        console.error(`[Delhivery] Failed to create shipment for order ${savedOrder.orderId}:`, err);
      }
    }

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

  // Admin: Update order status & auto-append tracking event
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) return null;

    order.status = status;

    // Auto-append new tracking event to history
    const label = STATUS_LABELS[status] || { message: `Status updated to ${status}` };
    const newEvent: TrackingEvent = {
      status,
      timestamp: new Date().toISOString(),
      message: label.message,
      location: label.location,
    };

    const history = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
    order.trackingHistory = [...history, newEvent];

    return this.orderRepo.save(order);
  }

  // Admin: Assign AWB tracking number + estimated delivery date from Delivery Limited
  async assignTracking(
    id: string,
    awbNumber: string,
    estimatedDelivery?: string,
    locationNote?: string,
  ): Promise<Order | null> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.awbNumber = awbNumber;
    order.courierPartner = 'Delivery Limited';
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    // Append a tracking note about the AWB assignment
    const history = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
    order.trackingHistory = [
      ...history,
      {
        status: order.status,
        timestamp: new Date().toISOString(),
        message: `AWB Number ${awbNumber} assigned by Delivery Limited.${locationNote ? ` ${locationNote}` : ''}`,
        location: locationNote,
      },
    ];

    return this.orderRepo.save(order);
  }

  // Public: Track order by orderId + phone (no auth needed — for customer tracking page)
  async getPublicOrderTracking(orderId: string, phone: string): Promise<Partial<Order> | null> {
    const order = await this.orderRepo.findOne({ where: { orderId } });
    if (!order) return null;

    // Verify phone matches for security
    if (order.shippingAddress?.phone !== phone) return null;

    // Return only tracking-relevant fields (do NOT expose userId, internal IDs, etc.)
    return {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      status: order.status,
      awbNumber: order.awbNumber,
      courierPartner: order.courierPartner || 'Delivery Limited',
      estimatedDelivery: order.estimatedDelivery,
      trackingHistory: order.trackingHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      totalAmount: order.totalAmount,
      shippingAddress: {
        fullName: order.shippingAddress?.fullName || '',
        city: order.shippingAddress?.city || '',
        pincode: order.shippingAddress?.pincode || '',
        phone: order.shippingAddress?.phone || '',
        addressLine1: order.shippingAddress?.addressLine1 || '',
        addressLine2: order.shippingAddress?.addressLine2,
        state: order.shippingAddress?.state,
      },
    };
  }

  // ─── Delivery Limited Webhook ────────────────────────────────────────────────
  // Called automatically by Delivery Limited's software when delivery status changes.
  // They must include header: Authorization: Bearer <DELIVERY_LIMITED_WEBHOOK_SECRET>
  //
  // Expected body: { awbNumber, status, location?, message?, timestamp? }
  // Supported auto-statuses from courier: out_for_delivery, delivered, dispatched
  async processWebhook(body: {
    awbNumber: string;
    status: OrderStatus;
    location?: string;
    message?: string;
    timestamp?: string;
  }): Promise<{ success: boolean; orderId?: string; message: string }> {
    const { awbNumber, status, location, message, timestamp } = body;

    if (!awbNumber) {
      return { success: false, message: 'awbNumber is required' };
    }

    // Find order by AWB number
    const order = await this.orderRepo.findOne({ where: { awbNumber } });
    if (!order) {
      return { success: false, message: `No order found with AWB: ${awbNumber}` };
    }

    // Skip if already delivered or cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return {
        success: true,
        orderId: order.orderId,
        message: `Order ${order.orderId} is already ${order.status}. No update applied.`,
      };
    }

    // Map courier status to our OrderStatus — Delivery Limited may send their own labels
    const validStatuses: OrderStatus[] = ['dispatched', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { success: false, message: `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}` };
    }

    // Apply the status update
    order.status = status;

    const label = STATUS_LABELS[status] || { message: `Status updated to ${status} by Delivery Limited.` };
    const trackingEvent: TrackingEvent = {
      status,
      timestamp: timestamp || new Date().toISOString(),
      message: message || label.message,
      location: location || label.location,
    };

    const history = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
    order.trackingHistory = [...history, trackingEvent];

    await this.orderRepo.save(order);

    console.log(`[Delivery Limited Webhook] Order ${order.orderId} status → ${status} (AWB: ${awbNumber})`);

    return {
      success: true,
      orderId: order.orderId,
      message: `Order ${order.orderId} updated to "${status}" successfully.`,
    };
  }

  // ─── Courier Delivery Boy Confirmation ───────────────────────────────────────
  // Used by the /store/courier-delivery page.
  // Delivery boy enters AWB number + shared PIN → order auto-marked delivered.
  async courierConfirmDelivery(
    awbNumber: string,
    pin: string,
  ): Promise<{ success: boolean; orderId?: string; customerName?: string; message: string }> {
    const expectedPin = process.env.COURIER_CONFIRM_PIN || 'avora2026';

    if (pin !== expectedPin) {
      return { success: false, message: 'Invalid PIN. Please check with your supervisor.' };
    }

    const order = await this.orderRepo.findOne({ where: { awbNumber } });
    if (!order) {
      return { success: false, message: `No order found with AWB number: ${awbNumber}` };
    }

    if (order.status === 'delivered') {
      return {
        success: true,
        orderId: order.orderId,
        customerName: order.shippingAddress?.fullName,
        message: `Order ${order.orderId} was already marked as delivered.`,
      };
    }

    if (order.status === 'cancelled') {
      return { success: false, message: `Order ${order.orderId} is cancelled. Cannot mark as delivered.` };
    }

    // Mark as delivered
    order.status = 'delivered';
    const history = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];
    order.trackingHistory = [
      ...history,
      {
        status: 'delivered' as OrderStatus,
        timestamp: new Date().toISOString(),
        message: 'Package delivered successfully by Delivery Limited. Confirmed by delivery partner.',
        location: order.shippingAddress?.city || 'Delivery Address',
      },
    ];

    await this.orderRepo.save(order);

    console.log(`[Courier Confirm] Order ${order.orderId} delivered by courier (AWB: ${awbNumber})`);

    return {
      success: true,
      orderId: order.orderId,
      customerName: order.shippingAddress?.fullName,
      message: `✅ Order ${order.orderId} successfully marked as delivered to ${order.shippingAddress?.fullName || 'customer'}!`,
    };
  }

  // ─── Delhivery: manual admin actions ─────────────────────────────────────────

  // Admin: retry Delhivery shipment creation for an order that didn't get an AWB
  // at checkout time (e.g. Delhivery was down, or DELHIVERY_API_TOKEN was unset).
  async retryDelhiveryOrderCreation(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.awbNumber) throw new BadRequestException(`Order already has AWB ${order.awbNumber}.`);

    const { waybill } = await this.delhiveryService.createOrder(order);
    order.awbNumber = waybill;
    order.courierPartner = 'Delhivery';
    order.trackingHistory = [
      ...(order.trackingHistory || []),
      { status: order.status, timestamp: new Date().toISOString(), message: `Shipment created with Delhivery. AWB: ${waybill}` },
    ];
    return this.orderRepo.save(order);
  }

  // Admin: schedule a physical pickup at the warehouse for everything manifested today
  async scheduleDelhiveryPickup(expectedPackageCount: number, pickupDate: string, pickupTime: string) {
    return this.delhiveryService.createPickupRequest(expectedPackageCount, pickupDate, pickupTime);
  }

  // Sanity-check tool for testing: verifies DELHIVERY_API_TOKEN + connectivity, and pincode coverage.
  async checkDelhiveryServiceability(pincode: string) {
    return this.delhiveryService.checkServiceability(pincode);
  }

  // Admin: mark an order as RTO (courier could not deliver, sending it back to warehouse)
  async markRto(id: string, reason: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = 'rto';
    order.rtoReason = reason;
    order.trackingHistory = [
      ...(order.trackingHistory || []),
      { status: 'rto', timestamp: new Date().toISOString(), message: `Returned to origin: ${reason}` },
    ];
    return this.orderRepo.save(order);
  }

  // Pull the latest status for one order's AWB from Delhivery and apply it locally.
  // Used both by the manual "sync" endpoint and by the cron job below.
  private async syncOneOrderWithDelhivery(order: Order): Promise<Order> {
    if (!order.awbNumber) return order;

    const result = await this.delhiveryService.trackShipment(order.awbNumber);
    if (!result.mappedStatus || result.mappedStatus === order.status) return order;

    // Never move a terminal order backwards
    if (['delivered', 'cancelled', 'rto'].includes(order.status)) return order;

    order.status = result.mappedStatus;
    if (result.mappedStatus === 'rto') {
      order.rtoReason = result.instructions || `Delhivery status: ${result.rawStatus}`;
    }
    order.trackingHistory = [
      ...(order.trackingHistory || []),
      {
        status: result.mappedStatus,
        timestamp: result.statusDateTime || new Date().toISOString(),
        message: `Delhivery status: ${result.rawStatus}${result.instructions ? ` (${result.instructions})` : ''}`,
        location: result.location,
      },
    ];
    return this.orderRepo.save(order);
  }

  // Admin: manually trigger a sync for a single order (useful for testing without waiting for the cron)
  async syncDelhiveryOrder(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.syncOneOrderWithDelhivery(order);
  }

  // Cron: every 30 minutes, poll Delhivery for every in-flight shipment and
  // update our local status (dispatched → out_for_delivery → delivered/rto).
  // This is the reliable path since Delhivery's push-webhook payload shape
  // isn't publicly documented — polling the Track API always works.
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncAllDelhiveryOrders(): Promise<void> {
    if (!process.env.DELHIVERY_API_TOKEN) return; // not configured yet — skip silently

    const inFlight = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.courierPartner = :cp', { cp: 'Delhivery' })
      .andWhere('o.awbNumber IS NOT NULL')
      .andWhere('o.status NOT IN (:...terminal)', { terminal: ['delivered', 'cancelled', 'rto'] })
      .getMany();

    for (const order of inFlight) {
      try {
        await this.syncOneOrderWithDelhivery(order);
      } catch (err) {
        console.error(`[Delhivery Sync] Failed to sync order ${order.orderId} (AWB ${order.awbNumber}):`, err);
      }
    }
  }

  // ─── Inbound webhook (in case push notifications are enabled on your Delhivery account) ────
  async processDelhiveryWebhook(body: { waybill: string; status: string; location?: string; instructions?: string }) {
    const { waybill, status, location, instructions } = body;
    if (!waybill) return { success: false, message: 'waybill is required' };

    const order = await this.orderRepo.findOne({ where: { awbNumber: waybill } });
    if (!order) return { success: false, message: `No order found with AWB: ${waybill}` };

    if (['delivered', 'cancelled', 'rto'].includes(order.status)) {
      return { success: true, orderId: order.orderId, message: `Order ${order.orderId} is already ${order.status}. No update applied.` };
    }

    await this.syncOneOrderWithDelhivery(order);
    return { success: true, orderId: order.orderId, message: `Order ${order.orderId} synced from Delhivery webhook (raw status: ${status}).` };
  }

  // ─── Courier partner dashboard stats ─────────────────────────────────────────
  // GET /orders/courier/stats?courierPartner=Delhivery
  async getCourierStats(courierPartner?: string) {
    const qb = this.orderRepo.createQueryBuilder('o');
    if (courierPartner) qb.andWhere('o.courierPartner = :cp', { cp: courierPartner });
    const orders = await qb.getMany();

    // Customer returns (post-delivery, customer-initiated) live in a separate table —
    // scope them to this courier's orders by joining on orderId.
    const orderIds = new Set(orders.map((o) => o.orderId));
    const allReturns = await this.returnRepo.find();
    const customerReturns = courierPartner
      ? allReturns.filter((r) => orderIds.has(r.orderId)).length
      : allReturns.length;

    return {
      received: orders.filter((o) => !!o.awbNumber).length,
      dispatched: orders.filter((o) => o.status === 'dispatched').length,
      outForDelivery: orders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      rto: orders.filter((o) => o.status === 'rto').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      customerReturns,
    };
  }
}

