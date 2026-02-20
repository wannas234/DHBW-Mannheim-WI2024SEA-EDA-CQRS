# Smart Home System - EDA & CQRS

Minimales Smart Home (TRANQUILO) System mit Event-Driven Architecture und CQRS Pattern.

## Setup

### Voraussetzungen
- Node.js 14+

### 1. Server starten

cd Wanisa

cd server

npm install

npm start


Server läuft auf ws://localhost:8080

### 2. Producer UI öffnen

Öffne producer-ui/index.html im Browser (zum Steuern)

### 3. Consumer UI öffnen

Öffne consumer-ui/index.html im Browser (zur Anzeige)

## Funktionalität

**Producer UI (Steuerung):**
- An/Aus für Lichter
- Heizung Temperatur ändern und aktivieren
- Alarm auslösen

**Consumer UI (Anzeige):**
- Zeigt alle Zustandsänderungen in Echtzeit
- Event-Log mit allen Aktionen

## Architektur


Producer (Befehl) → Server → EventBus → Consumer (Anzeige)

- **EDA:** EventBus koordiniert alles über Events
- **CQRS:** Commands (Write) sind getrennt von Queries (Read)
- **WebSocket:** Echtzeit-Kommunikation zwischen UI und Server
