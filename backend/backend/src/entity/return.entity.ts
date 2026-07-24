import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  orderId: string;

  @Column('text')
  reason: string;

  @Column({ default: 'pending' })
  status: ReturnStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
