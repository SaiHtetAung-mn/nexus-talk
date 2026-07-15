import { DataSource, MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Message } from '@/database/entities/Message';

@Injectable()
export class MessageRepository extends MongoRepository<Message> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Message, dataSource.mongoManager, dataSource.mongoManager.queryRunner);
  }
}
