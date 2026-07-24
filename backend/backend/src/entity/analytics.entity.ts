import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10 })
  date!: string; // YYYY-MM-DD

  @Column({ type: 'int', default: 0 })
  hour!: number; // 0-23

  @Column({ type: 'int', default: 0 })
  pageViews!: number;

  @Column({ type: 'int', default: 0 })
  productClicks!: number;

  @Column({ type: 'int', default: 0 })
  ordersCount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salesAmount!: number;
}
