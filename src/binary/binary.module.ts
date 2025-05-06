import { Module } from '@nestjs/common';
import { BinaryGateway } from './binary.gateway';

@Module({
  providers: [BinaryGateway],
  exports: [BinaryGateway]
})
export class BinaryModule {}