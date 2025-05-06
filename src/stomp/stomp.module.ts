import { Module } from '@nestjs/common';
import { StompGateway } from './stomp.gateway';

@Module({
  providers: [StompGateway],
  exports: [StompGateway]
})
export class StompModule {}