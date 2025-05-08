# 🔐 Comprendre le Hachage SHA-256 en Profondeur

---

## 🔍 Fonctionnement interne de SHA-256

SHA-256 transforme une entrée de **n’importe quelle taille** en une sortie fixe de **256 bits** (64 caractères hexadécimaux).

### 1. Prétraitement (Preprocessing)

#### a. Encodage en binaire

Le message est d'abord converti en binaire (UTF-8).

#### b. Ajout du bit '1'

Un bit `1` est ajouté à la fin du message binaire.

#### c. Padding (complément à 512 bits)

Le message est complété avec des `0` jusqu’à ce que la taille soit congrue à `448 mod 512`, pour réserver les **64 derniers bits** à la **longueur du message initial**.

**Exemple** :  
Pour le message `"abc"` :

- UTF-8 → binaire : `01100001 01100010 01100011`
- Ajout de `1`, puis padding avec `0`, puis la taille (`24 bits`) en binaire sur 64 bits.

---

### 2. Initialisation des registres

SHA-256 commence avec 8 constantes initiales de 32 bits :

- Issues des racines carrées des 8 premiers nombres premiers.
- Nommées `H0` à `H7`.

---

### 3. Découpage en blocs

Le message est divisé en blocs de **512 bits**.

---

### 4. Fonction de compression (64 tours)

Chaque bloc est traité avec **64 rounds** :

- Génération de 64 mots `W0` à `W63`.
- Calculs à chaque round avec :
  - Fonctions logiques : `Ch`, `Maj`, `Σ0`, `Σ1`
  - Opérations : `ROTR`, `XOR`, `ADD`
  - Ajout de **64 constantes K** (dérivées de racines cubiques)

À chaque tour :
