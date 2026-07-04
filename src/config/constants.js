const ROOMS = ["Drawing Room", "Work Room 1", "Work Room 2"];

const ROOM_POSITIONS = [
  { left: "5%", top: "16%", width: "28%", height: "68%" },
  { left: "36%", top: "16%", width: "28%", height: "68%" },
  { left: "67%", top: "16%", width: "28%", height: "68%" },
];

const DEVICE_TYPES = {
  LIGHT: "light",
  FAN: "fan",
};

const DEVICE_STATUS = {
  ON: "on",
  OFF: "off",
};

const ALERT_TYPES = {
  AFTER_HOURS: "after-hours",
  LONG_ON: "long-on",
  POWER_SPIKE: "power-spike",
  DEVICE_FAILURE: "device-failure",
  FORGOTTEN_DEVICE: "forgotten-device",
};

const DEVICE_SEED_CONFIG = {
  rooms: ROOMS,
  lightsPerRoom: 3,
  fansPerRoom: 2,
  lightPower: 15,
  fanPower: 60,
};

const MAX_LOG_LIMIT = 500;
const DEFAULT_LOG_LIMIT = 100;
const USAGE_RETENTION_DAYS = 30;

const ROOM_SYNONYMS = {
  "drawing room": "Drawing Room",
  drawing: "Drawing Room",
  "work room 1": "Work Room 1",
  work1: "Work Room 1",
  "work 1": "Work Room 1",
  "work room 2": "Work Room 2",
  work2: "Work Room 2",
  "work 2": "Work Room 2",
};

module.exports = {
  ROOMS,
  ROOM_POSITIONS,
  DEVICE_TYPES,
  DEVICE_STATUS,
  ALERT_TYPES,
  DEVICE_SEED_CONFIG,
  MAX_LOG_LIMIT,
  DEFAULT_LOG_LIMIT,
  USAGE_RETENTION_DAYS,
  ROOM_SYNONYMS,
};
