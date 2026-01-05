import { DataSource, MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from '@/database/entities/User';

@Injectable()
export class UserRepository extends MongoRepository<User> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(User, dataSource.mongoManager, dataSource.mongoManager.queryRunner);
  }
}
