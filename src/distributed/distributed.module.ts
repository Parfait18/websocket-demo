import { Module } from '@nestjs/common';
import { DistributedGateway } from './distributed.gateway';

@Module({
  providers: [DistributedGateway],
  exports: [DistributedGateway]
})
export class DistributedModule {}