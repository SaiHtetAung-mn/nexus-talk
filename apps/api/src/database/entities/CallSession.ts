import { Column, Entity, Index } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'call_sessions' })
@Index(['conversation_id', 'status'])
export class CallSession extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  conversation_id: string;

  @Column({ type: 'varchar', length: 50 })
  initiator_id: string;

  @Column()
  participant_ids: string[] = [];

  @Column({ type: 'varchar', default: 'video' })
  type: 'video' = 'video';

  @Column({ type: 'varchar', default: 'ringing' })
  status: 'ringing' | 'active' | 'ended' = 'ringing';

  @Column({ type: 'date', nullable: true, default: null })
  started_at: Date | null = null;

  @Column({ type: 'date', nullable: true, default: null })
  ended_at: Date | null = null;
}
