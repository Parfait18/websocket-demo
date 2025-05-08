import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SecureChatGateway } from './secure-chat.gateway';

@Module({
    imports: [
        JwtModule.register({
            secret: 'your-secret-key', // Replace with your actual secret key
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [SecureChatGateway],
    exports: [SecureChatGateway],
})
export class SecureChatModule { }