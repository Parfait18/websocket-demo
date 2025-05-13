import { Module } from '@nestjs/common';
import { BinaryGateway } from './binary.gateway';
import { WebrtcGateway } from './webrtc.gateway';

@Module({
  providers: [BinaryGateway, WebrtcGateway],
  exports: [BinaryGateway]
})
export class BinaryModule { }