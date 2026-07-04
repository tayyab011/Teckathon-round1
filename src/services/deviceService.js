const { getDb } = require("../db");

const upsertStmt = () =>
  getDb().prepare(
    `INSERT INTO devices (id, name, room, type, status, power_draw, uptime_seconds, runtime_seconds, last_changed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status=excluded.status,
       uptime_seconds=excluded.uptime_seconds,
       runtime_seconds=excluded.runtime_seconds,
       last_changed=excluded.last_changed`
  );

const insertLog = () =>
  getDb().prepare("INSERT INTO logs (device_id, action, timestamp) VALUES (?, ?, ?)");

const updateUptimeStmt = () =>
  getDb().prepare(
    "UPDATE devices SET uptime_seconds = ?, runtime_seconds = ? WHERE id = ?"
  );

let cachedDevices = [];
let lastFetch = 0;

function getAll() {
  const rows = getDb().prepare("SELECT * FROM devices ORDER BY id").all();
  cachedDevices = rows.map(formatDevice);
  lastFetch = Date.now();
  return cachedDevices;
}

function getByRoom(roomName) {
  return getAll().filter((d) => d.room.toLowerCase() === roomName.toLowerCase());
}

function getById(id) {
  return getAll().find((d) => d.id === id);
}

function formatDevice(d) {
  return {
    id: d.id,
    name: d.name,
    room: d.room,
    type: d.type,
    status: d.status,
    powerDrawWhenOn: d.power_draw,
    currentPower: d.status === "on" ? d.power_draw : 0,
    uptimeSeconds: d.uptime_seconds || 0,
    runtimeSeconds: d.runtime_seconds || 0,
    lastChanged: d.last_changed,
  };
}

function toggle(id) {
  const device = getById(id);
  if (!device) return null;

  const newStatus = device.status === "on" ? "off" : "on";
  device.status = newStatus;
  device.currentPower = newStatus === "on" ? device.powerDrawWhenOn : 0;
  device.lastChanged = new Date().toISOString();

  upsertStmt().run(
    device.id, device.name, device.room, device.type, device.status,
    device.powerDrawWhenOn, device.uptimeSeconds, device.runtimeSeconds,
    device.lastChanged
  );
  insertLog().run(
    device.id,
    newStatus === "on" ? "turned_on" : "turned_off",
    device.lastChanged
  );

  getAll();
  return device;
}

function updateRuntime(id, uptime, runtime) {
  updateUptimeStmt().run(uptime, runtime, id);
}

module.exports = { getAll, getByRoom, getById, toggle, updateRuntime };
