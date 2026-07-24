import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CreditStatus = 'active' | 'used' | 'expired' | 'cancelled';

@Entity('shopping_credits')
export class ShoppingCredit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({ type: 'varchar', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', nullable: true })
  userEmail?: string;

  @Column({ type: 'varchar', nullable: true })
  userName?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2000 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 6000 })
  minOrderValue!: number;

  @Column({ type: 'varchar', default: 'active' })
  status!: CreditStatus;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  originOrderId?: string;

  @Column({ type: 'varchar', nullable: true })
  usedOrderId?: string;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  issuedBy?: string; // 'system' or 'admin'

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
