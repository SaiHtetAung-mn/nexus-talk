import { Column, Entity, Index } from 'typeorm';
import BaseEntity from './_BaseEntity';

@Entity({ name: 'messages' })
@Index(['conversation_id', 'sequence'], { unique: true })
export class Message extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  conversation_id: string;

  @Column({ type: 'varchar', length: 50 })
  sender_id: string;

  @Column({ type: 'varchar', default: 'text' })
  type: 'text' = 'text';

  @Column({ type: 'varchar', length: 4000 })
  body: string;

  @Column({ type: 'int' })
  sequence: number;
}
