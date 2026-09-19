import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  // Small tag shown on the card, e.g. "HOT", "NEW", "LIMITED"
  @Column({ type: 'varchar', nullable: true })
  badge?: string;

  // Optional emoji/icon shown on the card (kept simple — no image upload needed for this)
  @Column({ type: 'varchar', nullable: true })
  icon?: string;

  @Column({ type: 'varchar', nullable: true })
  ctaText?: string;

  // Where "Shop Now" should navigate to, e.g. "/store" or "/store?category=Shirts"
  @Column({ type: 'varchar', nullable: true })
  ctaLink?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Lower numbers show first
  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
