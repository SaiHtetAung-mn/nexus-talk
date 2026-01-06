import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailService } from './mail-service';

@Injectable()
export class ResendMailService extends MailService {
  private readonly client: Resend;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.client = new Resend(this.config.get<string>('resendMailer.apiKey'));
    this.fromEmail = this.config.get<string>('resendMailer.fromEmail') ?? '';
    this.fromName = this.config.get<string>('resendMailer.fromName') ?? 'Nexus Talk';
  }

  async send(to: string, subject: string, content: string): Promise<void> {
    const res = await this.client.emails.send({
      from: `${this.fromName} <${this.fromEmail}>`,
      to,
      subject,
      html: content,
    });
    console.log(res)
  }
}
