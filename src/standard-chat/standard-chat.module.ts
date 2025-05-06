import { Module } from '@nestjs/common';
import { StandardChatGateway } from './standard-chat.gateway';

@Module({
    providers: [StandardChatGateway],
    exports: [StandardChatGateway]
})
export class StandardChatModule { }