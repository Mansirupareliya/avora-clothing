import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'integer' })
  productId!: number;

  @Column()
  productName!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  size?: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  category?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
