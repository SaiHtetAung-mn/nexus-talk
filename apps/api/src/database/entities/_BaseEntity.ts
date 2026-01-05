import { ObjectId } from 'mongodb';
import {
  CreateDateColumn,
  ObjectIdColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

abstract class BaseEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @CreateDateColumn({ default: () => new Date() })
  created_at: Timestamp = new Date() as any as Timestamp;

  @UpdateDateColumn({ default: () => new Date() })
  updated_at: Timestamp = new Date() as any as Timestamp;
}

export default BaseEntity;
