import { Controller, Get, Post, Patch, Body, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShoppingCreditsService } from '../service/shopping-credits.service';

@Controller('shopping-credits')
export class ShoppingCreditsController {
  constructor(private readonly creditsService: ShoppingCreditsService) {}

  // Customer/Admin: Get current promotional offer configuration
  @Get('config')
  getPromotionalConfig() {
    return this.creditsService.getPromotionalConfig();
  }

  // Admin: Update promotional offer configuration
  @Patch('admin/config')
  updatePromotionalConfig(@Body() body: any) {
    return this.creditsService.updatePromotionalConfig(body);
  }

  // Customer: Get credits list
  @Get('user')
  getUserCredits(@Query('userId') userId?: string, @Query('userEmail') userEmail?: string) {
    return this.creditsService.getUserCredits(userId, userEmail);
  }

  // Customer/Checkout: Get active available credit
  @Get('active')
  getActiveCredit(@Query('userId') userId?: string, @Query('userEmail') userEmail?: string) {
    return this.creditsService.getActiveCreditForUser(userId, userEmail);
  }

  // Admin: Get all promotional credits with search and status filter
  @Get('admin/all')
  getAllAdminCredits(@Query('search') search?: string, @Query('status') status?: string) {
    return this.creditsService.getAllAdminCredits(search, status);
  }

  // Admin: Get analytics
  @Get('admin/analytics')
  getAnalytics() {
    return this.creditsService.getAnalytics();
  }

  // Admin: Issue manual credit
  @Post('admin/issue')
  issueManualCredit(
    @Body()
    body: {
      userName: string;
      userEmail: string;
      userId?: string;
      amount?: number;
      minOrderValue?: number;
      expiryDays?: number;
    },
  ) {
    return this.creditsService.createManualCredit(body);
  }

  // Admin: Cancel credit
  @Patch('admin/:id/cancel')
  cancelCredit(@Param('id') id: string) {
    return this.creditsService.cancelCredit(id);
  }

  // Admin: Export CSV report
  @Get('admin/export')
  async exportReport(@Res() res: any) {
    const credits = await this.creditsService.getAllAdminCredits();

    let csvContent = 'Credit Code,Customer Name,Customer Email,Amount (INR),Min Order Value (INR),Status,Issued By,Expires At,Origin Order ID,Used Order ID,Created At\n';

    credits.forEach((c) => {
      const line = [
        `"${c.code}"`,
        `"${c.userName || ''}"`,
        `"${c.userEmail || ''}"`,
        c.amount,
        c.minOrderValue,
        `"${c.status}"`,
        `"${c.issuedBy || 'system'}"`,
        `"${c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : ''}"`,
        `"${c.originOrderId || ''}"`,
        `"${c.usedOrderId || ''}"`,
        `"${c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : ''}"`,
      ].join(',');
      csvContent += line + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="avora-shopping-credits-report.csv"');
    res.status(200).send(csvContent);
  }
}
