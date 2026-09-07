import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { RazorpayService } from '../service/razorpay.service';

@Controller('payments/razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  /**
   * POST /payments/razorpay/create-order
   *
   * Called by the frontend after the DB order is created (POST /orders/checkout).
   * Creates a Razorpay payment order and returns the details needed to open the checkout popup.
   *
   * Body: { dbOrderId: string, amount: number }
   * Response: { razorpayOrderId, amount (paise), currency, keyId }
   */
  @Post('create-order')
  @HttpCode(200)
  createOrder(
    @Body() body: { dbOrderId: string; amount: number; currency?: string },
  ) {
    const { dbOrderId, amount, currency } = body;
    return this.razorpayService.createOrder(dbOrderId, amount, currency);
  }

  /**
   * POST /payments/razorpay/verify
   *
   * Called by the frontend after the customer completes payment in the Razorpay popup.
   * Verifies HMAC SHA256 signature and marks order as paid in DB.
   *
   * Body: { dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
   * Response: { success: boolean, message: string }
   */
  @Post('verify')
  @HttpCode(200)
  verifyPayment(
    @Body()
    body: {
      dbOrderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    const { dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    return this.razorpayService.verifyPayment(
      dbOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
  }
}
