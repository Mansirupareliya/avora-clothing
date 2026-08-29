import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products.module';
import { CartModule } from './cart.module';
import { ReviewsModule } from './reviews.module';
import { AuthModule } from './auth.module';
import { ContactModule } from './contact.module';
import { AddressModule } from './address.module';
import { OrdersModule } from './orders.module';
import { ReturnsModule } from './returns.module';
import { WishlistModule } from './wishlist.module';
import { UserModule } from './user.module';
import { AnalyticsModule } from './analytics.module';

import { ShoppingCreditsModule } from './shopping-credits.module';
import { CouponModule } from './coupon.module';

// Build TypeORM connection config based on environment
const dbConfig = process.env.DATABASE_URL
  ? {
      // ── Render (production): connect via URL with SSL ──
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      // ── Local development: connect via individual params ──
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Postgres',
      database: process.env.DB_NAME || 'mens',
    };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...dbConfig,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductsModule,
    CartModule,
    ReviewsModule,
    AuthModule,
    ContactModule,
    AddressModule,
    OrdersModule,
    ReturnsModule,
    WishlistModule,
    UserModule,
    AnalyticsModule,
    ShoppingCreditsModule,
    CouponModule,
  ],
})
export class AppModule {}
