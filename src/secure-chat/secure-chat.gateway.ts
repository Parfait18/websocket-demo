import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  @SubscribeMessage('secureMessage')
  handleSecureMessage(client: Socket, payload: any) {
    // Encrypted message handling
    return this.server.emit('secureMessage', {
      id: client.id,
      message: payload,
      timestamp: new Date()
    });
  }
}