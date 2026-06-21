import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  mrp!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  category?: string;

  @Column('simple-array', { nullable: true })
  sizes?: string[];

  @Column({ nullable: true })
  imageUrl?: string;
}