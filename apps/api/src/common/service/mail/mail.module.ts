import { Module } from '@nestjs/common';
import { MailService } from './mail-service';
import { NodemailerMailService } from './nodemailer-mailer';

@Module({
  providers: [
    {
      provide: MailService,
      useClass: NodemailerMailService,
    },
  ],
  exports: [MailService],
})
export class MailerModule {}
