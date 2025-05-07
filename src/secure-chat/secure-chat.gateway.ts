import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'secure-chat',
  cors: {
    origin: '*',
  },
  transport: ['websocket'],
  secure: true
})
export class SecureChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('SecureChatGateway');

  @SubscribeMessage('secureMessage')
  handleSecureMessage(client: Socket, payload: any) {
    this.logger.log(`🔒 Message sécurisé reçu de ${client.id}`);
    return this.server.emit('secureMessage', {
      id: client.id,
      message: payload,
      timestamp: new Date()
    });
  }
}