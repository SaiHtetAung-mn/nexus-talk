import { Column, Entity } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'email_verifications' })
export class EmailVerification extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ type: 'date' })
  expired_at: Date;
}
