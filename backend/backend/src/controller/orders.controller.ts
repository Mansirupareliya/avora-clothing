import {
  Controller, Get, Post, Patch, Body, Param, Query,
  Headers, UnauthorizedException, UseGuards, Req, HttpCode,
} from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OrderStatus } from '../entity/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public/Checkout endpoint to create new customer order and generate sequential Order ID (AVR-1001)
  @Post('checkout')
  createCheckoutOrder(@Body() body: any) {
    return this.ordersService.create(body.userId || undefined, body);
  }

  // ─── Public Tracking Endpoint (no login required) ──────────────────────────
  // GET /orders/track/:orderId?phone=9876543210
  @Get('track/:orderId')
  getPublicTracking(
    @Param('orderId') orderId: string,
    @Query('phone') phone: string,
  ) {
    return this.ordersService.getPublicOrderTracking(orderId, phone);
  }

  // ─── Delhivery Webhook ───────────────────────────────────────────────────────
  // POST /orders/webhook/delhivery
  // Only useful if push notifications are enabled on your Delhivery account —
  // otherwise the cron job in OrdersService (every 30 min) covers this via polling.
  // Body: { waybill, status, location?, instructions? }
  @Post('webhook/delhivery')
  @HttpCode(200)
  async delhiveryWebhook(
    @Headers('authorization') authHeader: string,
    @Body() body: { waybill: string; status: string; location?: string; instructions?: string },
  ) {
    const secret = process.env.DELHIVERY_WEBHOOK_SECRET || 'avora-delhivery-webhook-secret-2026';
    const expected = `Bearer ${secret}`;
    if (!authHeader || authHeader !== expected) {
      throw new UnauthorizedException('Invalid webhook secret. Include Authorization: Bearer <secret> header.');
    }
    return this.ordersService.processDelhiveryWebhook(body);
  }

  // ─── Delivery Limited Webhook ───────────────────────────────────────────────
  // POST /orders/webhook/delivery-limited
  // Called automatically by Delivery Limited's software when they update delivery status.
  // Auth: Authorization header must be "Bearer <DELIVERY_LIMITED_WEBHOOK_SECRET>"
  //
  // Body: { awbNumber, status, location?, message?, timestamp? }
  // Example status values: "out_for_delivery", "delivered", "dispatched"
  @Post('webhook/delivery-limited')
  @HttpCode(200)
  async deliveryLimitedWebhook(
    @Headers('authorization') authHeader: string,
    @Body() body: {
      awbNumber: string;
      status: OrderStatus;
      location?: string;
      message?: string;
      timestamp?: string;
    },
  ) {
    const secret = process.env.DELIVERY_LIMITED_WEBHOOK_SECRET || 'avora-dl-webhook-secret-2026';
    const expected = `Bearer ${secret}`;

    if (!authHeader || authHeader !== expected) {
      throw new UnauthorizedException('Invalid webhook secret. Include Authorization: Bearer <secret> header.');
    }

    return this.ordersService.processWebhook(body);
  }

  // ─── Courier Delivery Boy Confirmation ─────────────────────────────────────
  // POST /orders/courier/confirm-delivery
  // Used by /store/courier-delivery page (no login, uses shared PIN)
  // Body: { awbNumber, pin }
  @Post('courier/confirm-delivery')
  @HttpCode(200)
  courierConfirmDelivery(
    @Body() body: { awbNumber: string; pin: string },
  ) {
    return this.ordersService.courierConfirmDelivery(body.awbNumber, body.pin);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────────────

  // Admin endpoint: Get all orders across store
  @Get('admin/all')
  getAllAdminOrders() {
    return this.ordersService.getAllAdminOrders();
  }

  // Courier partner dashboard: received / dispatched / out-for-delivery / delivered / RTO / cancelled counts
  // GET /orders/courier/stats?courierPartner=Delhivery
  @Get('courier/stats')
  getCourierStats(@Query('courierPartner') courierPartner?: string) {
    return this.ordersService.getCourierStats(courierPartner);
  }

  // Admin: retry Delhivery shipment creation for an order that has no AWB yet
  @Post(':id/delhivery/retry')
  retryDelhiveryOrderCreation(@Param('id') id: string) {
    return this.ordersService.retryDelhiveryOrderCreation(id);
  }

  // Admin: manually pull the latest status for one order from Delhivery (no need to wait for the cron)
  @Post(':id/delhivery/sync')
  syncDelhiveryOrder(@Param('id') id: string) {
    return this.ordersService.syncDelhiveryOrder(id);
  }

  // Admin: schedule a physical pickup at the warehouse for today's manifested shipments
  @Post('delhivery/schedule-pickup')
  scheduleDelhiveryPickup(@Body() body: { expectedPackageCount: number; pickupDate: string; pickupTime: string }) {
    return this.ordersService.scheduleDelhiveryPickup(body.expectedPackageCount, body.pickupDate, body.pickupTime);
  }

  // Admin: mark an order as RTO (courier could not deliver — sent back to warehouse)
  @Patch(':id/rto')
  markRto(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.ordersService.markRto(id, body.reason);
  }

  // Sanity-check tool: confirms your DELHIVERY_API_TOKEN + connectivity are working,
  // and whether a given pincode is serviceable, before placing a real test order.
  @Get('delhivery/serviceability/:pincode')
  checkDelhiveryServiceability(@Param('pincode') pincode: string) {
    return this.ordersService.checkDelhiveryServiceability(pincode);
  }

  // Admin endpoint: Update order status (auto-appends tracking event)
  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  // Admin endpoint: Assign AWB tracking number + estimated delivery from Delivery Limited
  @Patch(':id/tracking')
  assignTracking(
    @Param('id') id: string,
    @Body() body: { awbNumber: string; estimatedDelivery?: string; locationNote?: string },
  ) {
    return this.ordersService.assignTracking(
      id,
      body.awbNumber,
      body.estimatedDelivery,
      body.locationNote,
    );
  }

  // ─── User Endpoints (JWT protected) ────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll(@Req() req: any) {
    return this.ordersService.getAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.getOne(req.user.sub, id);
  }
}
