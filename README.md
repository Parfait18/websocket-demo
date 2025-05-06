Let me help you update the README.md file to include all the missing sections:

```markdown:/Users/parfait/Documents/www/websocket-demo/README.md
# WebSocket Demo Project

## Description

Ce projet démontre différentes implémentations de WebSocket en utilisant NestJS. Il comprend plusieurs types de WebSocket et leurs équivalents en API REST.

## Types de WebSocket Implémentés

1. **WebSocket Standard (RFC 6455)**
   - Chat en temps réel
   - Communication bidirectionnelle
   - Namespace: `/standard-chat`

2. **WebSocket Sécurisé (WSS)**
   - Communication chiffrée
   - Authentification sécurisée
   - Namespace: `/secure-chat`

3. **WebSocket avec Subprotocoles (STOMP)**
   - Gestion des topics
   - Publication/Souscription
   - Namespace: `/stomp`

4. **WebSocket Binaire**
   - Transfert de fichiers
   - Streaming de données
   - Namespace: `/binary`

5. **WebSocket Basse Latence**
   - Updates en temps réel
   - Optimisé pour les jeux
   - Namespace: `/low-latency`

6. **WebSocket Distribué**
   - Communication entre services
   - Gestion des microservices
   - Namespace: `/distributed`

## Installation et Configuration

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run start:dev

# Démarrage en mode production
npm run start:prod
```

## Documentation API

- Interface Swagger: `http://localhost:3000/api`
- Documentation JSON: `http://localhost:3000/api-json`

## Test des WebSockets

### 1. Via Interface Web
Accédez à `http://localhost:3000` pour tester toutes les implémentations via l'interface web.

### 2. Via Console Navigateur

```javascript
// Chat Standard
const standardChat = io('http://localhost:3000/standard-chat');
standardChat.emit('message', 'Hello World');
standardChat.on('message', (data) => console.log('Message reçu:', data));

// STOMP
const stomp = io('http://localhost:3000/stomp');
stomp.emit('subscribe', 'news');
stomp.emit('publish', { topic: 'news', message: 'Hello STOMP' });

// Chat Sécurisé
const secureChat = io('http://localhost:3000/secure-chat', { secure: true });
secureChat.emit('secureMessage', 'Message sécurisé');

// Binaire
const binary = io('http://localhost:3000/binary');
const file = new File(['Hello'], 'test.txt');
const reader = new FileReader();
reader.onload = (e) => binary.emit('binaryData', e.target.result);
reader.readAsArrayBuffer(file);

// Basse Latence
const game = io('http://localhost:3000/low-latency');
game.emit('gameState', { x: 100, y: 200 });

// Système Distribué
const distributed = io('http://localhost:3000/distributed');
distributed.emit('registerService', { name: 'service1', type: 'auth' });
```

### 3. Via CURL (API REST)

```bash
# Message Chat Standard
curl -X POST http://localhost:3000/ws/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "room": "general"}'

# Message Sécurisé
curl -X POST http://localhost:3000/ws/secure/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Secure Hello"}'

# Publication STOMP
curl -X POST http://localhost:3000/ws/stomp/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "news", "message": "Breaking news!"}'

# État des Connexions
curl http://localhost:3000/ws/connections
```

## Structure du Projet

```
src/
├── standard-chat/       # Chat standard
├── secure-chat/        # Chat sécurisé
├── stomp/             # Implementation STOMP
├── binary/            # Transfert binaire
├── low-latency/       # Communication basse latence
├── distributed/       # Système distribué
├── controllers/       # Contrôleurs REST
└── dto/              # Data Transfer Objects
```

## Événements WebSocket

### Standard Chat
- `message`: Envoi/réception de messages
- `joinRoom`: Rejoindre un salon
- `leaveRoom`: Quitter un salon

### Secure Chat
- `secureMessage`: Messages chiffrés
- `authenticate`: Authentification

### STOMP
- `subscribe`: Abonnement à un topic
- `publish`: Publication sur un topic
- `unsubscribe`: Désabonnement

### Binary
- `binaryData`: Données binaires
- `streamStart`: Début de stream
- `streamEnd`: Fin de stream

### Low Latency
- `gameState`: État du jeu
- `playerMove`: Mouvement joueur

### Distributed
- `registerService`: Enregistrement service
- `serviceEvent`: Événements service
- `heartbeat`: Contrôle santé

## Résolution des Problèmes

1. **Erreur de Connexion**
   - Vérifier que le serveur est lancé
   - Vérifier les paramètres CORS
   - Port 3000 doit être disponible

2. **Erreur WebSocket**
   - Vérifier la console navigateur
   - Confirmer le bon namespace
   - Vérifier les noms d'événements

## Sécurité et Performance

- WSS utilise TLS pour le chiffrement
- Authentification requise pour certains namespaces
- Validation des données entrantes
- Protection CORS configurée
- Optimisation basse latence
- Gestion efficace des connexions

## Licence

MIT
```