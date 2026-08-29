import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string; // ISO string
  location?: string;
  message?: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', nullable: true })
  orderNumber!: number;

  @Column({ type: 'varchar', nullable: true })
  orderId!: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'jsonb' })
  items!: Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    imageUrl?: string;
  }>;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    pincode: string;
    note?: string;
  };

  // ─── Courier / Tracking Fields ───────────────────────────────────────────────

  /** AWB (Air Waybill) number assigned by Delivery Limited */
  @Column({ type: 'varchar', nullable: true })
  awbNumber?: string;

  /** Courier partner name shown to customer */
  @Column({ type: 'varchar', nullable: true, default: 'Delivery Limited' })
  courierPartner?: string;

  /** Estimated delivery date set by admin when dispatching */
  @Column({ type: 'timestamptz', nullable: true })
  estimatedDelivery?: Date;

  /** Auto-appended log of every status change with timestamp + location */
  @Column({ type: 'jsonb', nullable: true, default: [] })
  trackingHistory?: TrackingEvent[];

  // ─────────────────────────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
