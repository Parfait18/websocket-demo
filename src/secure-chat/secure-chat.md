# Explication détaillée du client sécurisé Socket.IO

Ce document explique chaque partie du code suivant utilisé pour un client de chat sécurisé basé sur `Socket.IO`, `crypto`, et `JWT` avec `NestJS`.

---

## 1. Importations

```ts
import { io } from 'socket.io-client';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
```

- `io`: Fonction de Socket.IO pour établir une connexion côté client.
- `crypto`: Module natif de Node.js pour la cryptographie (génération de clés, signature, etc.).
- `JwtService`: Service NestJS utilisé pour générer un token JWT.

---

## 2. Génération des paires de clés RSA

```ts
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
```

- `generateKeyPairSync('rsa', ...)` : Génère une paire de clés RSA synchrones.
- `modulusLength: 2048` : Niveau de sécurité (2048 bits).
- `publicKeyEncoding`: Spécifie le format de sortie de la clé publique (`spki`/`pem`).
- `privateKeyEncoding`: Spécifie le format de sortie de la clé privée (`pkcs8`/`pem`).

Résultat : deux clés en format PEM (textes encodés en base64).

---

## 3. Génération du token JWT

```ts
const jwtService = new JwtService({
  secret: 'your-secret-key',
});

const token = jwtService.sign({
  username: 'TestSecureUser',
  sub: '1',
});
```

- Création d'un JWT signé localement avec une `clé secrète`.
- Payload : `username` et `sub` (subject = ID utilisateur).
- Le token est utilisé pour s’authentifier auprès du serveur sécurisé.

---

## 4. Connexion au serveur Socket.IO

```ts
const socket = io('http://localhost:3000/secure-chat', {
  auth: { token },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

- `url`: Le namespace sécurisé `/secure-chat`.
- `auth: { token }`: JWT envoyé au moment de la connexion.
- `transports`: Essayez WebSocket, sinon fallback vers `polling`.
- `reconnectionAttempts`: 5 tentatives en cas d’échec.
- `reconnectionDelay`: Attente de 1s entre les tentatives.

### Détail des transports

- **WebSocket** : rapide, bidirectionnel, connexion persistante.
- **Polling** : requêtes HTTP régulières comme solution de secours.

---

## 5. Gestion des erreurs de connexion

```ts
socket.on('connect_error', (error) => {
  log('ERROR', `❌ Erreur de connexion: ${error.message}`);
  setTimeout(() => {
    socket.connect();
  }, 2000);
});
```

- Si une erreur se produit, elle est affichée, et une reconnexion est tentée après 2 secondes.

---

## 6. Fonction de logs colorés

```ts
function log(type, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type}: ${message}`);
}
```

Affiche les logs avec horodatage et un type (INFO, ERROR, etc.).

---

## 7. Connexion et enregistrement du client

```ts
socket.on('connect', () => {
  log('INFO', '🔐 Connecté au serveur sécurisé');
  socket.emit('registerSecureUser', {
    username: 'TestSecureUser',
    publicKey: publicKey,
  });
});
```

- Quand la connexion est établie, le client envoie son nom d'utilisateur et sa clé publique au serveur pour s'enregistrer.

---

## 8. Envoi de messages sécurisés

```ts
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
```

- Crée une signature numérique du message avec la clé privée.
- Envoie le message, la signature, et un destinataire optionnel.

### Détail : Signature

```ts
const sign = crypto.createSign('SHA256');
sign.update(message);
const signature = sign.sign(privateKey, 'base64');
```

- Utilise SHA256 pour le hachage.
- Signature en base64 à transmettre au serveur pour vérification avec la clé publique.

---

## 9. Réception de messages

```ts
socket.on('secureMessage', (data) => {
  log('MESSAGE', `🔒 De ${data.username}: ${data.message}`);
});
```

Affiche les messages reçus depuis le serveur avec l’auteur.

---

## 10. Liste des utilisateurs connectés

```ts
socket.on('secureUserList', (users) => {
  log(
    'USERS',
    `👥 Utilisateurs connectés: ${users.map((u) => u.username).join(', ')}`,
  );
});
```

Affiche la liste des utilisateurs actuellement connectés.

---

## 11. Test automatique de message

```ts
setTimeout(() => {
  sendSecureMessage('Message test sécurisé');
}, 1000);
```

- Envoie un message automatique sécurisé après 1 seconde.

---

## 12. Déconnexion propre

```ts
process.on('SIGINT', () => {
  log('INFO', '👋 Déconnexion...');
  socket.disconnect();
  process.exit(0);
});
```

- Capture `Ctrl + C` dans la console.
- Déconnecte proprement le socket et quitte le processus Node.js.

---

## 🔐 Résumé : sécurité du chat

- Authentification via **JWT**.
- Chiffrement via **RSA** (clé privée pour signer, clé publique pour vérifier).
- Transmission uniquement de messages **signés**.
- Vérification des signatures côté serveur pour éviter toute falsification.

Tu peux tester cela avec un serveur Socket.IO configuré avec la même logique de signature et vérification.

Souhaites-tu aussi un fichier `.ts` complet prêt à exécuter avec ce code ?
