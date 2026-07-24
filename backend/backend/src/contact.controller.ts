import { Controller, Post, Body } from '@nestjs/common';
import { Resend } from 'resend';

@Controller('contact')
export class ContactController {
  @Post()
  async submitContact(@Body() body: any) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, subject, orderNumber, message } = body;
    
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Default testing sender provided by Resend
      to: 'abc@gmail.com', // Admin email
      subject: `New Inquiry: ${subject}`,
      html: `
        <h2>New Contact Us Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Order Number:</strong> ${orderNumber || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return { message: 'Inquiry sent successfully' };
  }
}
