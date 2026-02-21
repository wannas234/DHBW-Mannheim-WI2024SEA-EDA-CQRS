const http = require('http');
const WebSocket = require('ws');
const eventBus = require('./eventBus');
const { handleCommand } = require('./commandHandler');

const PORT = 8080;
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health' && req.method === 'GET') {
    handleHealthCheck(res);
    return;}
  if (req.url === '/events' && req.method === 'GET') {
    handleEventsQuery(res);
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});
function handleHealthCheck(res) {
  const health = {
    status: 'ALLES TRANQUILO',
    timestamp: new Date().toISOString(),
  };
  res.writeHead(200);
  res.end(JSON.stringify(health));
}
function handleEventsQuery(res) {
  const eventLog = eventBus.getEventLog();
  const response = {
    kind: 'ABFRAGE_ERGEBNIS',
    query: 'EREIGNISPROTOKOLL_ABRUFEN',
    data: eventLog,
    count: eventLog.length,
  };
  res.writeHead(200);
  res.end(JSON.stringify(response));}
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('[WebSocket] New client connected');
  eventBus.subscribe('home.lights', ws);
  eventBus.subscribe('home.heating', ws);
  eventBus.subscribe('home.security', ws);
  ws.send(JSON.stringify({
    kind: 'SYSTEM',
    type: 'VERBUNDEN',
    message: 'SmartHome Event Bus verbunden',
    timestamp: new Date().toISOString(),
  }));
  ws.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage);
      if (message.kind === 'BEFEHL') {
        handleCommandMessage(ws, message.command);
        return;
      }
      if (message.kind === 'ABFRAGE') {
        handleQueryMessage(ws, message.query);
        return;
      }
      sendError(ws, 'Ungültiger Nachrichtentyp. Erwartet: BEFEHL oder ABFRAGE');
    } catch (error) {
      sendError(ws, `Fehler beim Parsen der Nachricht: ${error.message}`);
    }
  });
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error.message);
  });
});
function handleCommandMessage(ws, command) {
  try {
    handleCommand(command);
    ws.send(JSON.stringify({
      kind: 'BESTÄTIGUNG',
      type: 'BEFEHL_AKZEPTIERT',
      commandType: command.type,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    sendError(ws, `Befehl fehlgeschlagen: ${error.message}`);
  }
}
function handleQueryMessage(ws, query) {
  if (query.type !== 'EREIGNISPROTOKOLL_ABRUFEN') {
    sendError(ws, `Nicht unterstützter Abfragetyp: ${query.type}`);
    return;
  }
  const eventLog = eventBus.getEventLog();
  ws.send(JSON.stringify({
    kind: 'ABFRAGE_ERGEBNIS',
    query: 'EREIGNISPROTOKOLL_ABRUFEN',
    data: eventLog,
    count: eventLog.length,
    timestamp: new Date().toISOString(),
  }));
}
function sendError(ws, message) {
  ws.send(JSON.stringify({
    kind: 'FEHLER',
    message,
    timestamp: new Date().toISOString(),
  }));
}
server.listen(PORT, () => {
  console.log(`[Server] Smart Home Event Bus running on ws://localhost:${PORT}`);
  console.log('[Server] HTTP endpoints: /health, /events');
  console.log('[Server] Ready to accept WebSocket connections');
});
