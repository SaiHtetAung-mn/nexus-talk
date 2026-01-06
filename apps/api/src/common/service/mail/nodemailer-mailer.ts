import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { MailService } from './mail-service';

@Injectable()
export class NodemailerMailService extends MailService {
  private readonly transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly logger = new Logger(NodemailerMailService.name);

  constructor(private readonly config: ConfigService) {
    super();

    const service = this.config.get<string>('mail.service')?.trim();
    const host = this.config.get<string>('mail.host');
    const port = this.config.get<number>('mail.port');
    const secure = this.config.get<boolean>('mail.secure');
    const username = this.config.get<string>('mail.username');
    const password = this.config.get<string>('mail.password');

    const auth =
      username && password
        ? {
            user: username,
            pass: password,
          }
        : undefined;

    if (service) {
      if (!auth) {
        throw new Error(
          'MAIL_USERNAME and MAIL_PASSWORD are required when MAIL_SERVICE is set.',
        );
      }
      this.transporter = nodemailer.createTransport({
        service,
        auth,
      });
    } else {
      if (!host || !port) {
        throw new Error('MAIL_HOST and MAIL_PORT must be configured.');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: Boolean(secure),
        auth,
      });
    }

    this.fromEmail = this.config.get<string>('mail.fromEmail') ?? '';
    this.fromName = this.config.get<string>('mail.fromName') ?? 'Nexus Talk';
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromEmail
          ? `${this.fromName} <${this.fromEmail}>`
          : undefined,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send email with Nodemailer', error as Error);
      throw error;
    }
  }
}
