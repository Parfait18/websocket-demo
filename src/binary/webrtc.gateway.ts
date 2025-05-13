import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: 'webrtc',
    cors: {
        origin: '*',  // Permet toutes les origines, à ajuster selon ton besoin
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
    transports: ['websocket'],
})
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WebrtcGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`🔌 Client connecté: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`❌ Client déconnecté: ${client.id}`);
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(client: Socket, { room }: { room: string }) {
        client.join(room);
        this.logger.log(`🚪 ${client.id} a rejoint la room: ${room}`);
        return { success: true };
    }

    @SubscribeMessage('webrtc-offer')
    handleOffer(client: Socket, { room, offer }: { room: string; offer: any }) {
        this.logger.log(`📨 Offre WebRTC de ${client.id} à la room: ${room}`);
        client.to(room).emit('webrtc-offer', { offer, from: client.id });
    }

    @SubscribeMessage('webrtc-answer')
    handleAnswer(client: Socket, { room, answer }: { room: string; answer: any }) {
        this.logger.log(`📨 Réponse WebRTC de ${client.id} à la room: ${room}`);
        client.to(room).emit('webrtc-answer', { answer, from: client.id });
    }

    @SubscribeMessage('webrtc-ice-candidate')
    handleCandidate(client: Socket, { room, candidate }: { room: string; candidate: any }) {
        this.logger.log(`📨 ICE candidate de ${client.id} à la room: ${room}`);
        client.to(room).emit('webrtc-ice-candidate', { candidate, from: client.id });
    }
}
