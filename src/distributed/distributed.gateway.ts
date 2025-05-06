import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

    private services = new Map<string, ServiceRegistrationDto>();

    @SubscribeMessage('register')
    handleRegisterService(client: Socket, service: ServiceRegistrationDto) {
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
        return {
            services: Array.from(this.services.values())
        };
    }

    @SubscribeMessage('heartbeat')
    handleHeartbeat(client: Socket, serviceName: string) {
        if (this.services.has(serviceName)) {
            return { success: true, timestamp: new Date() };
        }
        return { success: false, message: 'Service not found' };
    }
}