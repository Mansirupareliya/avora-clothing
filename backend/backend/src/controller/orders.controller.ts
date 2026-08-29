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
