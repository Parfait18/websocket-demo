import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('WebSocket Demo API')
        .setDescription('WebSocket implementations demo using NestJS')
        .setVersion('1.0')
        .addTag('websockets')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}
bootstrap();