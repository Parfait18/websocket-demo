import { Module } from '@nestjs/common';
import { LowLatencyGateway } from './low-latency.gateway';

@Module({
  providers: [LowLatencyGateway],
  exports: [LowLatencyGateway]
})
export class LowLatencyModule {}