import { Global, Module } from '@nestjs/common';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Global()
@Module({
  providers: [InMemoryDatabaseService],
  exports: [InMemoryDatabaseService],
})
export class SharedModule {}
