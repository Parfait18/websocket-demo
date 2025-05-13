import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'binary',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
  maxHttpBufferSize: 10e6  // Augmenté à 10MB
})
export class BinaryGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('BinaryGateway');
  private readonly activeStreams = new Map<string, Set<string>>();
  private readonly CHUNK_SIZE = 512 * 1024; // 512KB par chunk

  @SubscribeMessage('binaryData')
  async handleBinaryMessage(client: Socket, data: ArrayBuffer) {
    const maxSize = 10e6; // 10MB
    if (data.byteLength > maxSize) {
      this.logger.error(`❌ Données trop volumineuses (${data.byteLength} bytes) de ${client.id}`);
      return { success: false, error: `Taille maximale dépassée (${maxSize / 1e6}MB)` };
    }

    try {
      this.logger.log(`📦 Données binaires reçues de ${client.id} (Taille: ${data.byteLength} bytes)`);
      const buffer = Buffer.from(data);

      // Calcul du nombre de chunks nécessaires
      const totalChunks = Math.ceil(buffer.length / this.CHUNK_SIZE);
      const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Envoi des métadonnées
      this.server.emit('binaryStart', {
        transferId,
        totalSize: buffer.length,
        totalChunks,
        chunkSize: this.CHUNK_SIZE
      });

      // Découpage et envoi des chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, buffer.length);
        const chunk = buffer.slice(start, end);

        await new Promise(resolve => {
          this.server.emit('binaryChunk', {
            transferId,
            chunkIndex: i,
            totalChunks,
            chunk,
            size: chunk.length,
            isLast: i === totalChunks - 1
          });
          setTimeout(resolve, 50); // Petit délai entre les chunks pour éviter la surcharge
        });
      }

      // Notification de fin de transfert
      this.server.emit('binaryComplete', {
        transferId,
        totalSize: buffer.length,
        success: true
      });

      return {
        success: true,
        transferId,
        totalChunks,
        totalSize: buffer.length
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors du traitement des données: ${error.message}`);
      return { success: false, error: 'Erreur lors du traitement des données' };
    }
  }

}