export abstract class MailService {
  abstract send(to: string, subject: string, content: string): Promise<void>;
}
