import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
