import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'standard-chat',
  cors: {
    origin: '*',
  },
})
export class StandardChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
  }

  @SubscribeMessage('setUsername')
  handleSetUsername(client: Socket, username: string) {
    this.activeUsers.set(client.id, username);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
    return { success: true };
  }

  @SubscribeMessage('chatMessage')
  handleMessage(client: Socket, message: string) {
    const username = this.activeUsers.get(client.id) || client.id;
    this.server.emit('message', {
      username,
      message,
      timestamp: new Date().toISOString()
    });
  }
}