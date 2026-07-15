import { DataSource, MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { CallSession } from '@/database/entities/CallSession';

@Injectable()
export class CallRepository extends MongoRepository<CallSession> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(
      CallSession,
      dataSource.mongoManager,
      dataSource.mongoManager.queryRunner,
    );
  }
}
