import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../entity/analytics.entity';
import { Product } from '../entity/products.entity';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepo: Repository<Analytics>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedMonthlyAnalyticsIfEmpty();
  }

  private getTodayDateStr(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async seedMonthlyAnalyticsIfEmpty() {
    const count = await this.analyticsRepo.count();
    if (count > 0) return;

    // Seed current month data (July 2026) for rich real-time dashboard view
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const entries: Analytics[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const mm = String(month + 1).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;

      const isWeekend = (day % 7 === 0 || day % 7 === 6);
      const baseOrders = isWeekend ? 9 : 5;
      const seed = (day * 31) % 6;
      const ordersCount = baseOrders + seed;
      const salesAmount = ordersCount * (899 + (seed * 110));
      const pageViews = ordersCount * 45 + (seed * 80);
      const productClicks = Math.round(pageViews * 0.35);

      for (let hour = 0; hour < 24; hour++) {
        const hourRatio = (hour >= 18 && hour <= 22) ? 0.08 : (hour >= 10 && hour <= 17) ? 0.05 : 0.02;
        const entry = this.analyticsRepo.create({
          date: dateStr,
          hour,
          pageViews: Math.round(pageViews * hourRatio),
          productClicks: Math.round(productClicks * hourRatio),
          ordersCount: hour % 4 === 0 ? Math.round(ordersCount * hourRatio) : 0,
          salesAmount: hour % 4 === 0 ? Math.round(salesAmount * hourRatio) : 0,
        });
        entries.push(entry);
      }
    }

    await this.analyticsRepo.save(entries);

    // Seed product views and clicks in products table if 0
    const products = await this.productRepo.find();
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.views || p.views === 0) {
        const seed = ((p.id * 149) + (i * 73)) % 800;
        p.views = 420 + seed * 3;
        p.clicks = Math.round(p.views * 0.32);
        p.ordersCount = Math.round(p.clicks * 0.08);
        await this.productRepo.save(p);
      }
    }
  }

  async getDashboardAnalytics(yearMonth?: string) {
    const targetMonth = yearMonth || '2026-07';
    const rawData = await this.analyticsRepo
      .createQueryBuilder('a')
      .where('a.date LIKE :m', { m: `${targetMonth}%` })
      .getMany();

    // Group by Date
    const dateMap = new Map<string, { pageViews: number; productClicks: number; ordersCount: number; salesAmount: number }>();

    let totalViews = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    let totalSales = 0;

    rawData.forEach((row) => {
      totalViews += Number(row.pageViews) || 0;
      totalClicks += Number(row.productClicks) || 0;
      totalOrders += Number(row.ordersCount) || 0;
      totalSales += Number(row.salesAmount) || 0;

      const existing = dateMap.get(row.date) || { pageViews: 0, productClicks: 0, ordersCount: 0, salesAmount: 0 };
      existing.pageViews += Number(row.pageViews) || 0;
      existing.productClicks += Number(row.productClicks) || 0;
      existing.ordersCount += Number(row.ordersCount) || 0;
      existing.salesAmount += Number(row.salesAmount) || 0;
      dateMap.set(row.date, existing);
    });

    const dailyBreakdown = Array.from(dateMap.entries()).map(([dateStr, metrics]) => {
      const dayNum = parseInt(dateStr.split('-')[2], 10);
      return {
        dateStr,
        day: dayNum,
        ...metrics,
      };
    }).sort((a, b) => a.day - b.day);

    // Hourly analytics for today
    const todayStr = this.getTodayDateStr();
    const todayRows = rawData.filter((r) => r.date === todayStr);

    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
      const hourRows = todayRows.filter((r) => r.hour === hour);
      const views = hourRows.reduce((s, r) => s + Number(r.pageViews), 0);
      const clicks = hourRows.reduce((s, r) => s + Number(r.productClicks), 0);
      const orders = hourRows.reduce((s, r) => s + Number(r.ordersCount), 0);
      const sales = hourRows.reduce((s, r) => s + Number(r.salesAmount), 0);

      const hourFormatted = `${hour < 10 ? '0' : ''}${hour}:00`;
      return { hour: hourFormatted, hourNum: hour, views, clicks, orders, sales };
    });

    // Product-wise analytics
    const productsAnalytics = await this.productRepo.find({
      order: { views: 'DESC' },
    });

    return {
      monthName: targetMonth,
      totalViews,
      totalClicks,
      totalOrders,
      totalSales,
      avgOrderValue: Math.round(totalSales / (totalOrders || 1)),
      conversionRate: ((totalOrders / (totalClicks || 1)) * 100).toFixed(2),
      dailyBreakdown,
      hourlyBreakdown,
      productsAnalytics,
    };
  }

  async trackPageView() {
    const todayStr = this.getTodayDateStr();
    const hour = new Date().getHours();

    let record = await this.analyticsRepo.findOne({ where: { date: todayStr, hour } });
    if (!record) {
      record = this.analyticsRepo.create({ date: todayStr, hour, pageViews: 1 });
    } else {
      record.pageViews += 1;
    }
    await this.analyticsRepo.save(record);
    return { success: true };
  }

  async trackProductClick(productId: number) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (product) {
      product.views = (product.views || 0) + 1;
      product.clicks = (product.clicks || 0) + 1;
      await this.productRepo.save(product);
    }

    const todayStr = this.getTodayDateStr();
    const hour = new Date().getHours();

    let record = await this.analyticsRepo.findOne({ where: { date: todayStr, hour } });
    if (!record) {
      record = this.analyticsRepo.create({ date: todayStr, hour, productClicks: 1 });
    } else {
      record.productClicks += 1;
    }
    await this.analyticsRepo.save(record);
    return { success: true };
  }
}
