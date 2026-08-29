import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('coupon_usages')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  couponId!: string;

  @Column({ type: 'varchar' })
  couponCode!: string;

  @Column({ type: 'varchar', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', nullable: true })
  userEmail?: string;

  @Column({ type: 'varchar', nullable: true })
  orderId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountApplied!: number;

  @CreateDateColumn()
  usedAt!: Date;
}
