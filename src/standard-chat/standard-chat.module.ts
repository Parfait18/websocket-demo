import { Module } from '@nestjs/common';
import { StandardChatGateway } from './standard-chat.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: 'wA8$gD7f!Kp9eX@3zTnC#V1qRjL*MbYu',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [StandardChatGateway],
    exports: [StandardChatGateway]
})
export class StandardChatModule { }