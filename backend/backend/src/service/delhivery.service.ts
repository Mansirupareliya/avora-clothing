import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '../entity/order.entity';

// Maps Delhivery's own status vocabulary (from their Track API "Shipment.Status.Status")
// onto our internal OrderStatus. See: https://delhivery-express-api-doc.readme.io/reference/package-lifecycle-1
const DELHIVERY_STATUS_MAP: Record<string, OrderStatus> = {
  'Manifested': 'confirmed',
  'Not Picked': 'confirmed',
  'In Transit': 'dispatched',
  'Pending': 'dispatched',
  'Dispatched': 'out_for_delivery',
  'Delivered': 'delivered',
  'RTO': 'rto',
  'DTO': 'rto',
  'Return': 'rto',
  'Cancelled': 'cancelled',
};

export interface DelhiveryTrackResult {
  rawStatus: string;
  mappedStatus: OrderStatus | null;
  location?: string;
  statusDateTime?: string;
  instructions?: string;
}

@Injectable()
export class DelhiveryService {
  private readonly base =
    process.env.DELHIVERY_ENV === 'production'
      ? 'https://track.delhivery.com'
      : 'https://staging-express.delhivery.com';

  private readonly token = process.env.DELHIVERY_API_TOKEN;
  private readonly pickupLocationName = process.env.DELHIVERY_PICKUP_LOCATION_NAME;

  private headersJson() {
    return {
      Authorization: `Token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private headersForm() {
    return {
      Authorization: `Token ${this.token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  private assertConfigured() {
    if (!this.token || !this.pickupLocationName) {
      throw new Error(
        'Delhivery is not configured. Set DELHIVERY_API_TOKEN and DELHIVERY_PICKUP_LOCATION_NAME in .env before creating shipments.',
      );
    }
  }

  /** Step 1: check whether a pincode is serviceable by Delhivery before accepting the order. */
  async checkServiceability(pincode: string): Promise<{ serviceable: boolean; raw: any }> {
    this.assertConfigured();
    const res = await fetch(`${this.base}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: this.headersJson(),
    });
    const data = await res.json();
    const delivery = data?.delivery_codes?.[0]?.postal_code;
    return { serviceable: !!delivery && delivery.pre_paid === 'Y', raw: data };
  }

  /**
   * Step 4: create the shipment ("Package Order Creation/Manifestation API").
   * Called right after an order is saved in our DB.
   * Returns the Delhivery-assigned waybill on success.
   */
  async createOrder(order: Order): Promise<{ waybill: string; raw: any }> {
    this.assertConfigured();

    const addr = order.shippingAddress;
    if (!addr) throw new Error(`Order ${order.orderId} has no shippingAddress; cannot create Delhivery shipment.`);

    const payload = {
      shipments: [
        {
          name: addr.fullName,
          add: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
          pin: addr.pincode,
          city: addr.city,
          state: addr.state || '',
          country: 'India',
          phone: addr.phone,
          order: order.orderId,
          payment_mode: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
          cod_amount: order.paymentMethod === 'cod' ? order.totalAmount : 0,
          total_amount: order.totalAmount,
          products_desc: order.items.map((i) => i.productName).join(', '),
          quantity: String(order.items.reduce((s, i) => s + i.quantity, 0)),
          waybill: '', // blank → Delhivery auto-generates one
        },
      ],
      pickup_location: {
        name: this.pickupLocationName,
        add: process.env.WAREHOUSE_ADDRESS || '',
        city: process.env.WAREHOUSE_CITY || '',
        pin_code: process.env.WAREHOUSE_PINCODE || '',
        country: 'India',
        phone: process.env.WAREHOUSE_PHONE || '',
      },
    };

    const res = await fetch(`${this.base}/api/cmu/create.json`, {
      method: 'POST',
      headers: this.headersForm(),
      body: `format=json&data=${JSON.stringify(payload)}`,
    });

    const raw = await res.json();
    const waybill = raw?.packages?.[0]?.waybill;

    if (!res.ok || !waybill || raw?.packages?.[0]?.status === 'Fail') {
      throw new Error(
        `Delhivery order creation failed for ${order.orderId}: ${raw?.packages?.[0]?.remarks?.join?.(', ') || JSON.stringify(raw)}`,
      );
    }

    return { waybill, raw };
  }

  /** Step 6: ask Delhivery to physically collect today's manifested shipments from the warehouse. */
  async createPickupRequest(
    expectedPackageCount: number,
    pickupDate: string, // "YYYY-MM-DD"
    pickupTime: string, // "HH:mm:ss"
  ): Promise<{ pickupId: string; raw: any }> {
    this.assertConfigured();

    const res = await fetch(`${this.base}/fm/request/new/`, {
      method: 'POST',
      headers: this.headersJson(),
      body: JSON.stringify({
        pickup_time: pickupTime,
        pickup_date: pickupDate,
        pickup_location: this.pickupLocationName,
        expected_package_count: expectedPackageCount,
      }),
    });

    const raw = await res.json();
    const pickupId = raw?.pickup_id;
    if (!res.ok || !pickupId) {
      throw new Error(`Delhivery pickup request failed: ${JSON.stringify(raw)}`);
    }
    return { pickupId, raw };
  }

  /** Step 7: poll current status for one waybill (used by the cron sync job below). */
  async trackShipment(waybill: string): Promise<DelhiveryTrackResult> {
    this.assertConfigured();

    const res = await fetch(`${this.base}/api/v1/packages/json/?waybill=${waybill}`, {
      headers: this.headersJson(),
    });
    const raw = await res.json();
    const shipment = raw?.ShipmentData?.[0]?.Shipment;
    const rawStatus: string = shipment?.Status?.Status || 'Unknown';

    return {
      rawStatus,
      mappedStatus: DELHIVERY_STATUS_MAP[rawStatus] || null,
      location: shipment?.Status?.StatusLocation,
      statusDateTime: shipment?.Status?.StatusDateTime,
      instructions: shipment?.Status?.Instructions,
    };
  }
}
