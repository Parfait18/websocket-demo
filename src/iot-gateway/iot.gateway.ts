import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'iot',
  cors: {
    origin: '*',
  },
})
export class IotGateway {
  @WebSocketServer()
  server: Server;

  private sensors = new Map<string, any>();

  private readonly logger = new Logger('IotGateway');

  @SubscribeMessage('registerSensor')
  handleRegisterSensor(client: Socket, data: { sensorId: string, type: string }) {
    this.logger.log(`📡 Nouveau capteur enregistré - ID: ${data.sensorId}, Type: ${data.type}`);
    this.sensors.set(data.sensorId, {
      type: data.type,
      lastUpdate: new Date(),
      clientId: client.id
    });
    return { success: true };
  }

  @SubscribeMessage('sensorData')
  handleSensorData(client: Socket, data: { sensorId: string, value: number }) {
    const sensor = this.sensors.get(data.sensorId);
    if (sensor) {
      this.logger.log(`📊 Données reçues du capteur ${data.sensorId}: ${data.value}`);
      this.server.emit(`sensor.${data.sensorId}`, {
        value: data.value,
        timestamp: new Date(),
        type: sensor.type
      });
    } else {
      this.logger.error(`❌ Capteur non trouvé: ${data.sensorId}`);
    }
  }
}