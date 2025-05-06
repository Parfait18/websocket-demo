import { Module } from '@nestjs/common';
import { SecureChatGateway } from './secure-chat.gateway';

@Module({
    providers: [SecureChatGateway],
    exports: [SecureChatGateway]
})
export class SecureChatModule { }