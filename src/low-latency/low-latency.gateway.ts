import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'low-latency',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
  pingInterval: 1000,
  pingTimeout: 1000
})
export class LowLatencyGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('gameState')
  handleGameState(client: Socket, state: any) {
    // Immediate broadcast without buffering
    this.server.volatile.emit('gameUpdate', {
      state,
      timestamp: Date.now()
    });
  }
}