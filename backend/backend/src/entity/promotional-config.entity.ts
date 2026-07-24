import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('promotional_configs')
export class PromotionalConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 5000 })
  minTriggerSpend!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1500 })
  rewardAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 6000 })
  minRedeemOrderValue!: number;

  @Column({ type: 'int', default: 30 })
  expiryDays!: number;

  @Column({ type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ type: 'varchar', default: '₹1,500 Shopping Credit on ₹5,000+ Orders' })
  offerTitle!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
