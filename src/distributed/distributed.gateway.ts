import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ServiceRegistrationDto } from '../dto/websocket.dto';

@WebSocketGateway({
    namespace: 'distributed',
    cors: {
        origin: '*',
    }
})
export class DistributedGateway {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger('DistributedGateway');
    private services = new Map<string, ServiceRegistrationDto>();

    @SubscribeMessage('register')
    handleRegisterService(client: Socket, service: ServiceRegistrationDto) {
        this.logger.log(`📝 Service enregistré - Nom: ${service.name}, Type: ${service.type}`);
        this.services.set(service.name, service);
        this.server.emit('serviceRegistered', {
            name: service.name,
            type: service.type,
            timestamp: new Date()
        });
        return { success: true, service };
    }

    @SubscribeMessage('discover')
    handleDiscoverServices() {
        this.logger.log('🔍 Découverte des services demandée');
        return {
            services: Array.from(this.services.values())
        };
    }

    @SubscribeMessage('heartbeat')
    handleHeartbeat(client: Socket, serviceName: string) {
        if (this.services.has(serviceName)) {
            this.logger.log(`💓 Heartbeat reçu - Service: ${serviceName}`);
            return { success: true, timestamp: new Date() };
        }
        this.logger.error(`❌ Service non trouvé pour heartbeat: ${serviceName}`);
        return { success: false, message: 'Service not found' };
    }
}