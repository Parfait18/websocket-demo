import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    description: 'Message content to be sent',
    example: 'Hello, World!'
  })
  message: string;

  @ApiProperty({
    description: 'Chat room identifier',
    example: 'general',
    required: false
  })
  room?: string;
}

export class StompMessageDto {
  @ApiProperty({
    description: 'STOMP topic to publish to',
    example: 'news'
  })
  topic: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Breaking news!'
  })
  message: string;
}

export class GameStateDto {
  @ApiProperty({
    description: 'Current game state data',
    example: {
      position: { x: 100, y: 200 },
      score: 1000,
      level: 5
    }
  })
  state: any;
}

export class ServiceRegistrationDto {
  @ApiProperty({
    description: 'Service name',
    example: 'auth-service'
  })
  name: string;

  @ApiProperty({
    description: 'Service type',
    example: 'authentication',
    enum: ['authentication', 'payment', 'notification', 'analytics']
  })
  type: string;

  @ApiProperty({
    description: 'Service metadata',
    example: {
      version: '1.0.0',
      region: 'us-east-1'
    },
    required: false
  })
  metadata?: Record<string, any>;
}