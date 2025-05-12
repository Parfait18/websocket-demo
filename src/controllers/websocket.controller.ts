import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatMessageDto, StompMessageDto, GameStateDto, ServiceRegistrationDto } from '../dto/websocket.dto';
import { StandardChatGateway } from '../standard-chat/standard-chat.gateway';
import { SecureChatGateway } from '../secure-chat/secure-chat.gateway';
import { StompGateway } from '../stomp/stomp.gateway';
import { BinaryGateway } from '../binary/binary.gateway';
import { LowLatencyGateway } from '../low-latency/low-latency.gateway';
import { DistributedGateway } from '../distributed/distributed.gateway';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

/**
 * Contrôleur principal pour la gestion des WebSockets
 * Gère les différents types de communications en temps réel
 */
@ApiTags('websockets')
@Controller('ws')
export class WebSocketController {
  private readonly logger = new Logger('WebSocketController');

  constructor(
    private readonly standardChatGateway: StandardChatGateway,
    private readonly secureChatGateway: SecureChatGateway,
    private readonly stompGateway: StompGateway,
    private readonly binaryGateway: BinaryGateway,
    private readonly lowLatencyGateway: LowLatencyGateway,
    private readonly distributedGateway: DistributedGateway,
  ) {
    this.logger.log('🚀 Initialisation du contrôleur WebSocket');
  }

  @Post('chat/message')
  @ApiOperation({
    summary: 'Send a standard chat message',
    description: 'Broadcasts a message to all connected clients in the specified room'
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  sendChatMessage(@Body() messageDto: ChatMessageDto) {
    this.logger.log(`📨 Message chat envoyé - Room: ${messageDto.room || 'global'} - Message: ${messageDto.message}`);
    this.standardChatGateway.server.emit('message', {
      message: messageDto.message,
      room: messageDto.room,
      timestamp: new Date()
    });
    return { success: true };
  }

  @Post('secure/message')
  @ApiOperation({
    summary: 'Send a secure message',
    description: 'Sends an encrypted message through secure WebSocket connection'
  })
  @ApiResponse({
    status: 201,
    description: 'Secure message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  sendSecureMessage(@Body() messageDto: ChatMessageDto) {
    this.logger.log(`🔒 Message sécurisé envoyé - Message: ${messageDto.message}`);
    this.secureChatGateway.server.emit('secureMessage', {
      message: messageDto.message,
      timestamp: new Date()
    });
    return { success: true };
  }

  @Post('stomp/publish')
  @ApiOperation({
    summary: 'Publish a STOMP message',
    description: 'Publishes a message to a specific STOMP topic'
  })
  @ApiResponse({
    status: 201,
    description: 'STOMP message published successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  publishStompMessage(@Body() messageDto: StompMessageDto) {
    this.logger.log(`📢 Publication STOMP - Topic: ${messageDto.topic} - Message: ${messageDto.message}`);
    this.stompGateway.server.to(messageDto.topic).emit('message', {
      topic: messageDto.topic,
      message: messageDto.message,
      timestamp: new Date()
    });
    return { success: true };
  }

  @Post('game/state')
  @ApiOperation({
    summary: 'Update game state',
    description: 'Broadcasts game state updates using volatile messages for real-time gaming'
  })
  @ApiResponse({
    status: 201,
    description: 'Game state updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  updateGameState(@Body() stateDto: GameStateDto) {
    this.logger.log(`🎮 Mise à jour état du jeu - État: ${JSON.stringify(stateDto.state)}`);
    this.lowLatencyGateway.server.volatile.emit('gameUpdate', {
      state: stateDto,
      timestamp: Date.now()
    });
    return { success: true };
  }

  @Post('service/register')
  @ApiOperation({
    summary: 'Register a distributed service',
    description: 'Registers a new service in the distributed system'
  })
  @ApiResponse({
    status: 201,
    description: 'Service registered successfully',
    type: ServiceRegistrationDto
  })
  registerService(@Body() serviceDto: ServiceRegistrationDto) {
    this.logger.log(`📝 Enregistrement service - Nom: ${serviceDto.name} - Type: ${serviceDto.type}`);
    return this.distributedGateway.handleRegisterService(null, serviceDto);
  }

  @Get('connections')
  @ApiOperation({
    summary: 'Get active connections count',
    description: 'Returns the number of active connections for each WebSocket namespace'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the number of active connections',
    schema: {
      type: 'object',
      properties: {
        standardChat: { type: 'number', example: 10 },
        secureChat: { type: 'number', example: 5 },
        stomp: { type: 'number', example: 3 },
        lowLatency: { type: 'number', example: 20 },
        distributed: { type: 'number', example: 8 }
      }
    }
  })
  getConnections() {
    const connections = {
      standardChat: this.standardChatGateway.server.engine.clientsCount,
      secureChat: this.secureChatGateway.server.engine.clientsCount,
      stomp: this.stompGateway.server.engine.clientsCount,
      lowLatency: this.lowLatencyGateway.server.engine.clientsCount,
      distributed: this.distributedGateway.server.engine.clientsCount
    };
    this.logger.log(`📊 Statistiques de connexion:\n${JSON.stringify(connections, null, 2)}`);
    return connections;
  }

  @Post('chat/join')
  @ApiOperation({
    summary: 'Rejoindre une room de chat',
    description: 'Permet à un utilisateur de rejoindre une room de chat spécifique'
  })
  @ApiResponse({
    status: 201,
    description: 'Room rejointe avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  joinChatRoom(@Body() data: { room: string, clientId: string }) {
    this.logger.log(`👥 Tentative de connexion à la room - Room: ${data.room} - Client: ${data.clientId}`);
    const mockSocket = {
      id: data.clientId,
      join: (room: string) => {
        this.logger.debug(`🔄 Simulation join pour ${data.clientId} dans ${room}`);
      },
      emit: (event: string, data: any) => {
        this.logger.debug(`🔄 Simulation emit pour ${event}`);
      },
      data: {
        user: {
          username: 'Anonymous'
        }
      }
    } as Socket;
    return this.standardChatGateway.handleJoinRoom(mockSocket, data.room);
  }

  @Post('chat/leave')
  @ApiOperation({
    summary: 'Quitter une room de chat',
    description: 'Permet à un utilisateur de quitter une room de chat spécifique'
  })
  @ApiResponse({
    status: 201,
    description: 'Room quittée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  leaveChatRoom(@Body() data: { room: string, clientId: string }) {
    this.logger.log(`👋 Départ de la room - Room: ${data.room} - Client: ${data.clientId}`);
    return this.standardChatGateway.handleLeaveRoom({ id: data.clientId } as Socket, data.room);
  }

  @Post('chat/username')
  @ApiOperation({
    summary: 'Définir un nom d\'utilisateur',
    description: 'Permet à un utilisateur de définir son nom d\'utilisateur pour le chat'
  })
  @ApiResponse({
    status: 201,
    description: 'Nom d\'utilisateur défini avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  setUsername(@Body() data: { username: string, clientId: string }) {
    this.logger.log(`👤 Définition username - Client: ${data.clientId} - Username: ${data.username}`);
    return this.standardChatGateway.handleSetUsername({ id: data.clientId } as Socket, data.username);
  }

  @Post('binary/stream/start')
  @ApiOperation({
    summary: 'Démarrer un stream binaire',
    description: 'Initialise une nouvelle session de streaming binaire'
  })
  @ApiResponse({
    status: 201,
    description: 'Stream démarré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        streamId: { type: 'string', example: 'stream-123' }
      }
    }
  })
  startBinaryStream(@Body() data: { streamId: string, clientId: string }) {
    this.logger.log(`🎥 Démarrage stream binaire - ID: ${data.streamId}, Client: ${data.clientId}`);
    return this.binaryGateway.handleStreamStart({ id: data.clientId } as Socket, { id: data.streamId });
  }

  @Post('binary/stream/data')
  @ApiOperation({
    summary: 'Envoyer des données de stream',
    description: 'Envoie des données binaires à un stream existant'
  })
  @ApiResponse({
    status: 201,
    description: 'Données envoyées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  sendStreamData(@Body() data: { streamId: string, clientId: string, binaryData: Buffer }) {
    this.logger.log(`📤 Envoi données stream - Stream: ${data.streamId}, Client: ${data.clientId}`);
    const mockSocket = { id: data.clientId } as Socket;
    return this.binaryGateway.handleStreamData(mockSocket, {
      streamId: data.streamId,
      data: data.binaryData
    });
  }
}