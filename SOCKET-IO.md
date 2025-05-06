## Socket.IO - Guide Complet des Fonctions Socket

### 1. `socket.on(event, callback)`

**Écoute un événement.**

```ts
socket.on('message', (data) => {
  console.log('Message reçu :', data);
});
```

- `"message"` : nom de l’événement écouté.
- `callback(data)` : fonction appelée à la réception de l'événement.

---

### 2. `socket.emit(event, data)`

**Émet un événement vers le serveur.**

```ts
socket.emit('message', 'Bonjour !');
```

---

### 3. `socket.off(event, callback?)`

**Supprime un écouteur.**

```ts
const callback = (data) => console.log(data);
socket.on('message', callback);
socket.off('message', callback); // stop listening
```

---

### 4. `socket.once(event, callback)`

**Écoute un événement une seule fois.**

```ts
socket.once('connected', () => {
  console.log('Connecté une seule fois !');
});
```

---

### 5. `socket.disconnect()`

**Déconnecte manuellement le client.**

```ts
socket.disconnect();
```

---

### 6. `socket.connect()`

**Reconnecte le client.**

```ts
socket.connect();
```

---

### 7. `socket.id`

**Renvoie l'identifiant unique de la connexion.**

```ts
console.log(socket.id);
```

---

### 8. `socket.connected`

**Renvoie `true` si connecté.**

```ts
if (socket.connected) {
  console.log('En ligne !');
}
```

---

### 9. `socket.on("connect")` et `socket.on("disconnect")`

**Connexion et déconnexion.**

```ts
socket.on('connect', () => {
  console.log('Connecté au serveur !');
});

socket.on('disconnect', (reason) => {
  console.log('Déconnecté :', reason);
});
```

---

### 10. `socket.on("connect_error", (err) => {...})`

**Gestion des erreurs de connexion.**

```ts
socket.on('connect_error', (err) => {
  console.error('Erreur de connexion :', err.message);
});
```

---

### 11. `socket.emit(..., callback)`

**Émet un événement et reçoit une réponse (acknowledgment).**

```ts
socket.emit('join-room', 'room1', (response) => {
  console.log('Réponse du serveur :', response);
});
```

Côté serveur (NestJS) :

```ts
@SubscribeMessage('join-room')
handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
  client.join(room);
  return 'Inscrit dans la room ' + room;
}
```

---

### ✅ Résumé des Fonctions Socket.IO les plus utilisées

| Fonction                     | Rôle                                      |
| ---------------------------- | ----------------------------------------- |
| `socket.on()`                | Écouter un événement                      |
| `socket.emit()`              | Émettre un événement                      |
| `socket.off()`               | Retirer un listener                       |
| `socket.once()`              | Écouter un événement une seule fois       |
| `socket.disconnect()`        | Se déconnecter manuellement               |
| `socket.connect()`           | Se reconnecter                            |
| `socket.id`                  | ID du socket                              |
| `socket.connected`           | Vérifier la connexion                     |
| `socket.on("connect")`       | Quand la connexion est établie            |
| `socket.on("disconnect")`    | Quand la connexion est perdue             |
| `socket.on("connect_error")` | Gérer les erreurs de connexion            |
| `socket.emit(..., callback)` | Envoyer un événement avec réponse serveur |

---

## Exemple Complet React - Intégration Socket.IO

```tsx
// socket.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adapt to your backend
export default socket;
```

```tsx
// ChatComponent.tsx
import { useEffect, useState } from 'react';
import socket from './socket';

export default function ChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}
```
