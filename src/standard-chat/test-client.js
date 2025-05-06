import { io } from 'socket.io-client';
import chalk from 'chalk';

// Fonction de logging avec timestamp
function log(type, message) {
  const timestamp = new Date().toISOString();
  const types = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    error: chalk.red('✖'),
    warning: chalk.yellow('⚠'),
    event: chalk.magenta('⚡'),
    room: chalk.cyan('⌂'),
    user: chalk.yellow('👤'),
  };
  console.log(`${types[type] || '•'} [${timestamp}] ${message}`);
}

// Exemple de génération de token côté serveur (NestJS)
// const token = await this.jwtService.sign({ username: 'TestUser' });
// Configuration du client avec authentification JWT
const socket = io('http://localhost:3000/standard-chat', {
  // auth: {
  // token: token,
  // },
});

// Gestion de la connexion
socket.on('connect', () => {
  log('success', 'Connecté au serveur');

  // Définir le nom d'utilisateur
  socket.emit('setUsername', 'TestUser', (response) => {
    console.log('[response]', response);
    if (response.success) {
      log('user', "Nom d'utilisateur défini avec succès");
      testFunctionalities();
    } else {
      log('error', "Échec de la définition du nom d'utilisateur");
    }
  });
});

// Fonction de test des fonctionnalités
async function testFunctionalities() {
  // Test des rooms
  await testRooms();

  // Test des messages
  await testMessages();

  // Test des commandes spéciales
  await testSpecialCommands();
}

// Test des rooms
async function testRooms() {
  // Rejoindre des rooms
  const rooms = ['general', 'tech', 'random'];

  for (const room of rooms) {
    socket.emit('joinRoom', room, (response) => {
      if (response.success) {
        log('room', `Rejoint la room: ${room}`);
      } else {
        log('error', `Échec de l'accès à la room: ${room}`);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// Test des messages
async function testMessages() {
  const testMessages = [
    { room: 'general', message: 'Bonjour tout le monde!' },
    { room: 'tech', message: 'Des développeurs en ligne?' },
    { room: 'random', message: 'Test de message random' },
  ];

  for (const msg of testMessages) {
    socket.emit('chatMessage', msg);
    log('info', `Message envoyé dans ${msg.room}: ${msg.message}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Test des commandes spéciales
async function testSpecialCommands() {
  // Quitter une room
  socket.emit('leaveRoom', 'random', (response) => {
    if (response.success) {
      log('room', 'Quitté la room: random');
    }
  });
}

// Écouteurs d'événements
socket.on('message', (data) => {
  log(
    'event',
    `Message reçu dans ${data.room} de ${data.username}: ${data.message}`,
  );
});

socket.on('messageHistory', (data) => {
  log('info', `Historique des messages pour ${data.room}:`);
  data.messages.forEach((msg) => {
    log('info', `  ${msg.username} (${msg.timestamp}): ${msg.message}`);
  });
});

socket.on('userList', (users) => {
  log('user', `Utilisateurs actifs: ${users.join(', ')}`);
});

// Gestion des erreurs
socket.on('connect_error', (error) => {
  log('error', `Erreur de connexion: ${error.message}`);
});

socket.on('disconnect', (reason) => {
  log('warning', `Déconnecté: ${reason}`);
});

// Gestion propre de la déconnexion
process.on('SIGINT', () => {
  log('warning', 'Déconnexion en cours...');
  socket.disconnect();
  process.exit(0);
});

// Installation des dépendances nécessaires
// Exécutez d'abord : npm install chalk
