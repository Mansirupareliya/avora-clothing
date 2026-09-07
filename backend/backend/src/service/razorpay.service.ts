import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn(
        '[RazorpayService] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment. ' +
        'Payment features will not work until these are configured.',
      );
    }

    this.razorpay = new Razorpay({
      key_id: keyId || 'rzp_test_placeholder',
      key_secret: keySecret || 'placeholder_secret',
    });
  }

  /**
   * Creates a Razorpay order for the given DB orderId and amount.
   * Stores the razorpayOrderId back on the DB order row.
   * Returns { razorpayOrderId, amount, currency, keyId } to the frontend.
   */
  async createOrder(
    dbOrderId: string,
    amountInRupees: number,
    currency = 'INR',
  ): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountInRupees * 100);

    let razorpayOrder: any;
    try {
      razorpayOrder = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: dbOrderId,
        notes: {
          avora_order_id: dbOrderId,
        },
      });
    } catch (err: any) {
      console.error('[RazorpayService] Failed to create Razorpay order:', err);
      throw new InternalServerErrorException(
        err?.error?.description || 'Failed to create Razorpay payment order. Check API keys.',
      );
    }

    // Persist razorpayOrderId on the DB order for verification later
    try {
      await this.orderRepo.update(
        { orderId: dbOrderId },
        {
          razorpayOrderId: razorpayOrder.id,
          paymentMethod: 'razorpay',
          paymentStatus: 'unpaid',
        },
      );
    } catch (err) {
      console.error('[RazorpayService] Failed to persist razorpayOrderId on DB order:', err);
    }

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || '',
    };
  }

  /**
   * Verifies the Razorpay payment signature using HMAC SHA256.
   * On success, marks the DB order as paid.
   */
  async verifyPayment(
    dbOrderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<{ success: boolean; message: string }> {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Razorpay HMAC verification: sign "razorpay_order_id|razorpay_payment_id"
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      // Mark order as failed in DB
      try {
        await this.orderRepo.update(
          { orderId: dbOrderId },
          { paymentStatus: 'failed' },
        );
      } catch (err) {
        console.error('[RazorpayService] Failed to update paymentStatus to failed:', err);
      }
      throw new BadRequestException('Payment verification failed: signature mismatch.');
    }

    // Signature is valid — mark order as paid
    try {
      await this.orderRepo.update(
        { orderId: dbOrderId },
        {
          paymentStatus: 'paid',
          razorpayPaymentId,
          razorpayOrderId,
        },
      );
    } catch (err) {
      console.error('[RazorpayService] Failed to update order to paid:', err);
      throw new InternalServerErrorException('Payment verified but failed to update order status.');
    }

    console.log(`[RazorpayService] Payment verified & order ${dbOrderId} marked as PAID. razorpayPaymentId: ${razorpayPaymentId}`);

    return {
      success: true,
      message: `Payment successful! Order ${dbOrderId} is now confirmed and paid.`,
    };
  }
}
