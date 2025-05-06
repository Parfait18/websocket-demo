import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StandardChatModule } from './standard-chat/standard-chat.module';
import { SecureChatModule } from './secure-chat/secure-chat.module';
import { StompModule } from './stomp/stomp.module';
import { BinaryModule } from './binary/binary.module';
import { LowLatencyModule } from './low-latency/low-latency.module';
import { DistributedModule } from './distributed/distributed.module';
import { WebSocketController } from './controllers/websocket.controller';

@Module({
    imports: [
        StandardChatModule,
        SecureChatModule,
        StompModule,
        BinaryModule,
        LowLatencyModule,
        DistributedModule
    ],
    controllers: [AppController, WebSocketController],
    providers: [AppService],
})
export class AppModule { }