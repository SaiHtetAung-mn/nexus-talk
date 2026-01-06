import { Module } from "@nestjs/common";
import { MailService } from "./mail-service";
import { ResendMailService } from "./resend-mailer";

@Module({
  providers: [
    {
      provide: MailService,
      useClass: ResendMailService,
    },
  ],
  exports: [MailService],
})
export class MailerModule {}
