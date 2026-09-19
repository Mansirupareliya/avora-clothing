import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type DiscountType = 'flat' | 'percent';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({ type: 'varchar', default: 'flat' })
  discountType!: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ type: 'int', nullable: true })
  usageLimit?: number;

  @Column({ type: 'int', default: 0 })
  usedCount!: number;

  @Column({ type: 'int', default: 1 })
  perUserLimit!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  // Homepage promo banner (e.g. "GET 15% OFF ON YOUR FIRST ORDER")
  @Column({ type: 'boolean', default: false })
  featuredOnBanner!: boolean;

  @Column({ type: 'varchar', nullable: true })
  bannerImageUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  bannerSubtext?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
