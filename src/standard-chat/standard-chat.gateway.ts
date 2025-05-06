import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
  private readonly logger = new Logger('StandardChatGateway');
  private messageHistory = new Map<string, Array<any>>(); // Historique par room
  private userRooms = new Map<string, Set<string>>(); // Rooms par utilisateur

  constructor(private jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      // Pour le développement/test, accepter sans token
      this.logger.log(`🟢 Client connecté: ${client.id}`);
      client.data.user = { username: 'TestUser' };


      // const token = client.handshake.auth.token;
      // const payload = await this.jwtService.verifyAsync(token);
      // client.data.user = payload;

    } catch (error) {
      this.logger.error(`❌ Erreur de connexion: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔴 Client déconnecté: ${client.id}`);
    this.activeUsers.delete(client.id);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
  }

  @SubscribeMessage('setUsername')
  handleSetUsername(client: Socket, username: string) {
    this.logger.log(`👤 Username défini pour ${client.id}: ${username}`);
    this.activeUsers.set(client.id, username);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
    return { success: true };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomName: string) {
    client.join(roomName);
    if (!this.userRooms.has(client.id)) {
      this.userRooms.set(client.id, new Set());
    }
    this.userRooms.get(client.id).add(roomName);

    // Envoyer l'historique des messages de la room
    const history = this.messageHistory.get(roomName) || [];
    client.emit('messageHistory', { room: roomName, messages: history });

    this.logger.log(`👥 ${client.data.user.username} a rejoint la room: ${roomName}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomName: string) {
    client.leave(roomName);
    this.userRooms.get(client.id)?.delete(roomName);
    this.logger.log(`👋 ${client.data.user.username} a quitté la room: ${roomName}`);
    return { success: true };
  }

  @SubscribeMessage('chatMessage')
  handleMessage(client: Socket, data: { room: string, message: string }) {
    const username = client.data.user.username;
    const messageData = {
      username,
      message: data.message,
      room: data.room,
      timestamp: new Date().toISOString()
    };

    // Sauvegarder dans l'historique
    if (!this.messageHistory.has(data.room)) {
      this.messageHistory.set(data.room, []);
    }
    this.messageHistory.get(data.room).push(messageData);

    // Limiter l'historique à 100 messages par room
    if (this.messageHistory.get(data.room).length > 100) {
      this.messageHistory.get(data.room).shift();
    }

    this.logger.log(`💬 Message reçu de ${username} dans ${data.room}: ${data.message}`);
    this.server.to(data.room).emit('message', messageData);
  }
}