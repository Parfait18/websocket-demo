import { io } from 'socket.io-client';
import * as fs from 'fs';

// Configuration du client
const socket = io('http://localhost:3000/binary', {
  transports: ['websocket'],
});

// Fonction de logging
function log(type, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type}: ${message}`);
}

// Gestion de la connexion
socket.on('connect', () => {
  log('INFO', '📡 Connecté au serveur binaire');
  testBinaryTransfer();
  testStreamFeature();
});

// Test de transfert binaire
async function testBinaryTransfer() {
  try {
    // Création d'un buffer de test
    const testData = Buffer.from('Test de données binaires');

    // Envoi des données binaires
    socket.emit('binaryData', testData, (response) => {
      log('INFO', '📤 Données binaires envoyées');
      log('INFO', `📤 Réponse ${response}`);
    });
  } catch (error) {
    log('ERROR', `❌ Erreur lors du transfert binaire: ${error.message}`);
  }
}

// Test de streaming
function testStreamFeature() {
  const streamMetadata = {
    id: 'test-stream-001',
    type: 'binary-test',
  };

  socket.emit('streamStart', streamMetadata, (response) => {
    if (response.success) {
      log('INFO', `🎥 Stream démarré avec ID: ${response.streamId}`);
    } else {
      log('ERROR', '❌ Échec du démarrage du stream');
    }
  });
}

// Réception des données binaires
socket.on('binaryResponse', (data) => {
  const buffer = Buffer.from(data);
  log('DATA', `📥 Données reçues: ${buffer.toString()}`);
});

// Gestion des erreurs
socket.on('connect_error', (error) => {
  log('ERROR', `❌ Erreur de connexion: ${error.message}`);
});

// Déconnexion propre
process.on('SIGINT', () => {
  log('INFO', '👋 Déconnexion...');
  socket.disconnect();
  process.exit(0);
});
