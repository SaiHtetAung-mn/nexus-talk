import { DataSource, MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Conversation } from '@/database/entities/Conversation';

@Injectable()
export class ConversationRepository extends MongoRepository<Conversation> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(
      Conversation,
      dataSource.mongoManager,
      dataSource.mongoManager.queryRunner,
    );
  }
}
