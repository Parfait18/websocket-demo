## README - standard-chat Gateway avec WebSocket et Socket.IO (NestJS)

Ce fichier explique **chaque ligne** du code source pour la passerelle WebSocket `StandardChatGateway` utilisée dans un chat en temps réel avec **NestJS** et **Socket.IO**.

---

### 📁 Fichier : `standard-chat.gateway.ts`

```ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
```

👉 Import des décorateurs et interfaces nécessaires à la création d'une passerelle WebSocket avec NestJS.

```ts
import { Server, Socket } from 'socket.io';
```

👉 Import des types `Server` et `Socket` de Socket.IO pour gérer la connexion serveur et les clients.

```ts
@WebSocketGateway({
  namespace: 'standard-chat',
  cors: {
    origin: '*',
  },
})
```

👉 Crée une passerelle WebSocket avec :

* `namespace: 'standard-chat'` : le client se connecte via `/standard-chat`
* `cors.origin: '*'` : permet à tout domaine d'accéder à cette passerelle (utile en dev).

```ts
export class StandardChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
```

👉 Déclaration de la classe et implémentation des interfaces `OnGatewayConnection` et `OnGatewayDisconnect` pour gérer les connexions/déconnexions clients.

```ts
  @WebSocketServer()
  server: Server;
```

👉 Initialise une instance du serveur Socket.IO.

```ts
  private activeUsers = new Map<string, string>();
```

👉 Stocke les utilisateurs actifs avec :

* `clé`: ID du socket
* `valeur`: nom d’utilisateur

---

### 🔌 Connexion / Déconnexion

```ts
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }
```

👉 Appelé automatiquement quand un client se connecte. Affiche son ID dans la console.

```ts
  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
  }
```

👉 Appelé quand un client se déconnecte :

* Supprime l’utilisateur de `activeUsers`
* Émet un événement `userList` contenant la nouvelle liste des utilisateurs actifs

---

### 💬 Gestion des messages côté client

```ts
  @SubscribeMessage('setUsername')
  handleSetUsername(client: Socket, username: string) {
    this.activeUsers.set(client.id, username);
    this.server.emit('userList', Array.from(this.activeUsers.values()));
    return { success: true };
  }
```

👉 Écoute l’événement `setUsername` pour enregistrer le pseudo d’un utilisateur :

* Ajoute l’utilisateur dans `activeUsers`
* Diffuse la liste actualisée des utilisateurs

```ts
  @SubscribeMessage('chatMessage')
  handleMessage(client: Socket, message: string) {
    const username = this.activeUsers.get(client.id) || client.id;
    this.server.emit('message', {
      username,
      message,
      timestamp: new Date().toISOString()
    });
  }
```

👉 Écoute l’événement `chatMessage` :

* Récupère le nom d’utilisateur (ou l’ID socket si non défini)
* Émet un message à tous les clients avec :

  * `username`
  * `message`
  * `timestamp` ISO

---

### ✅ Résumé des événements

| Événement client       | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `setUsername`          | Envoie un nom d'utilisateur au serveur            |
| `chatMessage`          | Envoie un message de chat au serveur              |
| `message` (réception)  | Reçoit un message de chat avec nom et timestamp   |
| `userList` (réception) | Reçoit la liste des utilisateurs actifs connectés |

---

### 🔧 Exemple de Connexion côté Client

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000/standard-chat');

socket.emit('setUsername', 'Parfait');
socket.emit('chatMessage', 'Bonjour à tous !');

socket.on('message', (data) => console.log(data));
socket.on('userList', (list) => console.log('Utilisateurs actifs :', list));
```


---

### 🧠 Remarques

* `Map<string, string>` est utilisé ici pour gérer dynamiquement les utilisateurs sans doublon.
* Toutes les émissions sont **broadcast** à tous les clients connectés (via `this.server.emit`).
* Le `namespace` est important : le client \*\*doit se connecter à \*\*\`\`.
* Les décorateurs `@WebSocketGateway`, `@WebSocketServer` et `@SubscribeMessage` permettent à NestJS de relier automatiquement les méthodes aux événements WebSocket.

---

> Ce système peut être étendu avec des rooms, des authentifications JWT, des historiques de messages, etc.












