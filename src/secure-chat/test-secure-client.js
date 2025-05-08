import { io } from 'socket.io-client';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
// Génération des clés
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Create a JWT token
const jwtService = new JwtService({
  secret: 'your-secret-key', // This should match the secret in secure-chat.module.ts
});

const token = jwtService.sign({
  username: 'TestSecureUser',
  sub: '1',
});

log('TOKEN', token);
// Configuration du client
const socket = io('http://localhost:3000/secure-chat', {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add error handling
socket.on('connect_error', (error) => {
  log('ERROR', `❌ Erreur de connexion: ${error.message}`);
  // Attempt to reconnect
  setTimeout(() => {
    socket.connect();
  }, 2000);
});

// Logs colorés
function log(type, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type}: ${message}`);
}

// Connexion
socket.on('connect', () => {
  log('INFO', '🔐 Connecté au serveur sécurisé');

  // Enregistrement
  socket.emit('registerSecureUser', {
    username: 'TestSecureUser',
    publicKey: publicKey,
  });
});

// Envoi de message sécurisé
function sendSecureMessage(message, recipient = null) {
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  const signature = sign.sign(privateKey, 'base64');

  socket.emit('secureMessage', {
    message,
    signature,
    recipient,
  });
}

// Réception des messages
socket.on('secureMessage', (data) => {
  log('MESSAGE', `🔒 De ${data.username}: ${data.message}`);
});

// Liste des utilisateurs
socket.on('secureUserList', (users) => {
  log(
    'USERS',
    `👥 Utilisateurs connectés: ${users.map((u) => u.username).join(', ')}`,
  );
});

// Gestion des erreurs
socket.on('connect_error', (error) => {
  log('ERROR', `❌ Erreur de connexion: ${error.message}`);
});

// Test des fonctionnalités
setTimeout(() => {
  sendSecureMessage('Message test sécurisé');
}, 1000);

// Déconnexion propre
process.on('SIGINT', () => {
  log('INFO', '👋 Déconnexion...');
  socket.disconnect();
  process.exit(0);
});
