import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from '../service/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardAnalytics(@Query('month') month?: string) {
    return this.analyticsService.getDashboardAnalytics(month);
  }

  @Post('track-view')
  trackPageView() {
    return this.analyticsService.trackPageView();
  }

  @Post('track-click/:productId')
  trackProductClick(@Param('productId', ParseIntPipe) productId: number) {
    return this.analyticsService.trackProductClick(productId);
  }
}
