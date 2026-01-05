import { Column, Entity } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  username: string;

  @Column({ type: 'text', nullable: true, default: null, select: false })
  password: string | null = null;

  @Column({ type: 'varchar', default: 'local' })
  provider: 'local' | 'google' = 'local';

  @Column({ type: 'varchar', default: null, nullable: true })
  provider_id: string | null = null;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean = false;
}
