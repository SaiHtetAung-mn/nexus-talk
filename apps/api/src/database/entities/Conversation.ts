import { Column, Entity, Index } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'conversations' })
@Index(['direct_key'], { unique: true, sparse: true })
export class Conversation extends BaseEntity {
  @Column({ type: 'varchar', default: 'direct' })
  type: 'direct' | 'group' = 'direct';

  @Column()
  member_ids: string[] = [];

  @Column({ type: 'int', default: 0 })
  member_count: number = 0;

  @Column({ type: 'varchar', nullable: true, default: null })
  direct_key: string | null = null;

  @Column({ type: 'int', default: 0 })
  next_message_sequence: number = 0;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_message_id: string | null = null;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_message_sender_id: string | null = null;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_message_text: string | null = null;

  @Column({ type: 'date', nullable: true, default: null })
  last_message_at: Date | null = null;
}
