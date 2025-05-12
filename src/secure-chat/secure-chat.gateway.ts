import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@WebSocketGateway({
  namespace: 'secure-chat',
  cors: {
    origin: '*',
  },
  transport: ['websocket'],
  secure: true
})
export class SecureChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('SecureChatGateway');
  private activeUsers = new Map<string, { username: string, publicKey: string }>();
  private messageHistory = new Map<string, Array<any>>();

  constructor(private jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      this.logger.log(`🔐 Client authentifié connecté: ${client.id}`);
    } catch (error) {
      this.logger.error(`❌ Erreur d'authentification: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔴 Client sécurisé déconnecté: ${client.id}`);
    this.activeUsers.delete(client.id);
    this.server.emit('secureUserList', Array.from(this.activeUsers.values()));
  }

  @SubscribeMessage('registerSecureUser')
  handleRegisterUser(client: Socket, data: { username: string, publicKey: string }) {
    this.activeUsers.set(client.id, {
      username: data.username,
      publicKey: data.publicKey
    });
    this.logger.log(`👤 Utilisateur sécurisé enregistré: ${data.username}`);
    this.server.emit('secureUserList', Array.from(this.activeUsers.values()));
    return { success: true };
  }

  @SubscribeMessage('secureMessage')
  handleSecureMessage(client: Socket, payload: {
    message: string,
    signature: string,
    recipient?: string
  }) {
    const sender = this.activeUsers.get(client.id);
    if (!sender) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const messageData = {
      id: client.id,
      username: sender.username,
      message: payload.message,
      signature: payload.signature,
      timestamp: new Date()
    };

    // Vérifier la signature du message
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(payload.message);
      const isValid = verify.verify(sender.publicKey, payload.signature, 'base64');

      if (!isValid) {
        throw new Error('Signature invalide');
      }

      if (payload.recipient) {
        // Message privé
        this.server.to(payload.recipient).emit('secureMessage', messageData);
      } else {
        // Message broadcast
        this.server.emit('secureMessage', messageData);
      }

      // Sauvegarder dans l'historique
      this.messageHistory.get('global')?.push(messageData);

      this.logger.log(`🔒 Message sécurisé validé de ${sender.username}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Erreur de vérification: ${error.message}`);
      return { success: false, error: 'Erreur de vérification du message' };
    }
  }

  @SubscribeMessage('getSecureHistory')
  handleGetHistory(client: Socket) {
    return {
      success: true,
      history: this.messageHistory.get('global') || []
    };
  }
}