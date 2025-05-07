import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'binary',
  cors: {
    origin: '*',
  }
})
export class BinaryGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('BinaryGateway');

  @SubscribeMessage('binaryData')
  handleBinaryMessage(client: Socket, data: ArrayBuffer) {
    this.logger.log(`📦 Données binaires reçues de ${client.id}`);
    const buffer = Buffer.from(data);
    this.server.emit('binaryResponse', buffer);
  }

  @SubscribeMessage('streamStart')
  handleStreamStart(client: Socket, metadata: any) {
    this.logger.log(`🎥 Début du stream - ID: ${metadata.id}, Client: ${client.id}`);
    client.join(`stream-${metadata.id}`);
    return { success: true, streamId: metadata.id };
  }
}