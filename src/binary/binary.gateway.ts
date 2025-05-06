import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'binary',
  cors: {
    origin: '*',
  }
})
export class BinaryGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('binaryData')
  handleBinaryMessage(client: Socket, data: ArrayBuffer) {
    // Handle binary data
    const buffer = Buffer.from(data);
    
    // Process binary data and broadcast
    this.server.emit('binaryResponse', buffer);
  }

  @SubscribeMessage('streamStart')
  handleStreamStart(client: Socket, metadata: any) {
    client.join(`stream-${metadata.id}`);
    return { success: true, streamId: metadata.id };
  }
}