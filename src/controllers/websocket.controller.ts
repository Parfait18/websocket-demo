import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatMessageDto, StompMessageDto, GameStateDto, ServiceRegistrationDto } from '../dto/websocket.dto';
import { StandardChatGateway } from '../standard-chat/standard-chat.gateway';
import { SecureChatGateway } from '../secure-chat/secure-chat.gateway';
import { StompGateway } from '../stomp/stomp.gateway';
import { BinaryGateway } from '../binary/binary.gateway';
import { LowLatencyGateway } from '../low-latency/low-latency.gateway';
import { DistributedGateway } from '../distributed/distributed.gateway';

@ApiTags('websockets')
@Controller('ws')
export class WebSocketController {
  constructor(
    private readonly standardChatGateway: StandardChatGateway,
    private readonly secureChatGateway: SecureChatGateway,
    private readonly stompGateway: StompGateway,
    private readonly binaryGateway: BinaryGateway,
    private readonly lowLatencyGateway: LowLatencyGateway,
    private readonly distributedGateway: DistributedGateway,
  ) { }

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
    return {
      standardChat: this.standardChatGateway.server.engine.clientsCount,
      secureChat: this.secureChatGateway.server.engine.clientsCount,
      stomp: this.stompGateway.server.engine.clientsCount,
      lowLatency: this.lowLatencyGateway.server.engine.clientsCount,
      distributed: this.distributedGateway.server.engine.clientsCount
    };
  }
}