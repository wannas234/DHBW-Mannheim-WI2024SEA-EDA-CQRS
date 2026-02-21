const eventBus = require('./eventBus');

function handleCommand(command) {
  if (!command || !command.type) {
    throw new Error('Befehl muss einen Typ haben');
  }
  switch (command.type) {
    case 'LICHT_UMSCHALTEN':
      handleToggleLight(command.payload);
      break;
    case 'HEIZUNG_STELLEN':
      handleSetHeating(command.payload);
      break;
    case 'ALARM_AKTIVIEREN':
      handleActivateAlarm(command.payload);
      break;
    default:
      throw new Error(`Unbekannter Befehl: ${command.type}`);
  }
}
function handleToggleLight(payload) {
  if (!payload || !payload.room || !payload.state) {
    throw new Error('LICHT_UMSCHALTEN benötigt Raum und Zustand');
  }
  eventBus.publish({
    topic: 'home.lights',
    type: 'LICHT_UMGESCHALTET',
    payload: {
      room: payload.room,
      state: payload.state,
    },
  });
}
function handleSetHeating(payload) {
  if (!payload || payload.temperature === undefined || !payload.mode) {
    throw new Error('HEIZUNG_STELLEN benötigt Temperatur und Modus');
  }
  eventBus.publish({
    topic: 'home.heating',
    type: 'HEIZUNG_GEÄNDERT',
    payload: {
      temperature: payload.temperature,
      mode: payload.mode,
    },
  });
}
function handleActivateAlarm(payload) {
  if (!payload || !payload.zone || !payload.wichtigkeit) {
    throw new Error('ALARM_AKTIVIEREN benötigt Zone und wichtigkeit');
  }
  eventBus.publish({
    topic: 'home.security',
    type: 'ALARM_AUSGELÖST',
    payload: {
      zone: payload.zone,
      wichtigkeit: payload.wichtigkeit,
    },
  });
}
module.exports = { handleCommand };
