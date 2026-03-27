import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import {
  exportReadyTemplate,
  inviteTemplate,
  reminderTemplate,
} from './email.templates';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.from = this.config.get<string>(
      'EMAIL_FROM',
      'CoParent <noreply@coparent.app>',
    );
  }

  async sendInvite(
    to: string,
    inviterName: string,
    spaceTitle: string,
    inviteCode: string,
  ): Promise<void> {
    const html = inviteTemplate(inviterName, spaceTitle, inviteCode);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `${inviterName} invited you to join ${spaceTitle} on CoParent`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send invite email to ${to}`, error);
      throw new Error(`Failed to send invite email: ${error.message}`);
    }

    this.logger.log(`Invite email sent to ${to}`);
  }

  async sendExport(
    to: string,
    userName: string,
    exportType: string,
    attachmentUrl?: string,
  ): Promise<void> {
    const html = exportReadyTemplate(userName, exportType, attachmentUrl);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Your ${exportType} export is ready — CoParent`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send export email to ${to}`, error);
      throw new Error(`Failed to send export email: ${error.message}`);
    }

    this.logger.log(`Export email sent to ${to}`);
  }

  async sendReminder(
    to: string,
    userName: string,
    reminderType: string,
    details: string,
  ): Promise<void> {
    const html = reminderTemplate(userName, reminderType, details);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Reminder: ${reminderType} — CoParent`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send reminder email to ${to}`, error);
      throw new Error(`Failed to send reminder email: ${error.message}`);
    }

    this.logger.log(`Reminder email sent to ${to}`);
  }
}
