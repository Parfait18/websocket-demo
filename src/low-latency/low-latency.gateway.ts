import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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

  private readonly logger = new Logger('LowLatencyGateway');

  @SubscribeMessage('gameState')
  handleGameState(client: Socket, state: any) {
    this.logger.log(`🎮 Mise à jour état du jeu - Client: ${client.id}`);
    this.server.volatile.emit('gameUpdate', {
      state,
      timestamp: Date.now()
    });
  }
}