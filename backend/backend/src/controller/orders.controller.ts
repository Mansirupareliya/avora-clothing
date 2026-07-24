import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
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

  // Admin endpoint: Get all orders across store
  @Get('admin/all')
  getAllAdminOrders() {
    return this.ordersService.getAllAdminOrders();
  }

  // Admin endpoint: Update order status
  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  // User endpoints (JWT protected)
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
