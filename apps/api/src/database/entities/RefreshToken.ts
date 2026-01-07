import { Column, Entity, Index } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'refresh_tokens' })
@Index(['session_id'], { unique: true })
export class RefreshToken extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  session_id: string;

  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  @Column({ type: 'date' })
  expires_at: Date;

  @Column({ type: 'date', nullable: true, default: null })
  rotated_at: Date | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  user_agent: string | null = null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  ip_address: string | null = null;
}
