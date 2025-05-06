import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: 'stomp',
    cors: {
        origin: '*',
    }
})
export class StompGateway {
    @WebSocketServer()
    server: Server;

    private topics = new Map<string, Set<string>>();

    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, topic: string) {
        if (!this.topics.has(topic)) {
            this.topics.set(topic, new Set());
        }
        this.topics.get(topic).add(client.id);
        client.join(topic);
        return { success: true };
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(client: Socket, topic: string) {
        if (this.topics.has(topic)) {
            this.topics.get(topic).delete(client.id);
            client.leave(topic);
        }
        return { success: true };
    }

    @SubscribeMessage('publish')
    handlePublish(client: Socket, data: { topic: string; message: any }) {
        this.server.to(data.topic).emit('message', {
            topic: data.topic,
            message: data.message,
            timestamp: new Date()
        });
        return { success: true };
    }
}