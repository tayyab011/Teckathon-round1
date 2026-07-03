require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Database ───
const db = new Database(path.join(__dirname, "office.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('light','fan')),
    status TEXT NOT NULL DEFAULT 'off' CHECK(status IN ('on','off')),
    power_draw INTEGER NOT NULL,
    last_changed TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(device_id) REFERENCES devices(id)
  );
  CREATE TABLE IF NOT EXISTS usage_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_kwh REAL NOT NULL DEFAULT 0,
    recorded_at TEXT NOT NULL
  );
`);

const upsertStmt = db.prepare(`
  INSERT INTO devices (id, name, room, type, status, power_draw, last_changed)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET status=excluded.status, last_changed=excluded.last_changed
`);

const insertLog = db.prepare(`
  INSERT INTO logs (device_id, action, timestamp) VALUES (?, ?, ?)
`);

function getDevices() {
  const rows = db.prepare("SELECT * FROM devices ORDER BY id").all();
  return rows.map(d => ({
    id: d.id,
    name: d.name,
    room: d.room,
    type: d.type,
    status: d.status,
    powerDrawWhenOn: d.power_draw,
    currentPower: d.status === "on" ? d.power_draw : 0,
    lastChanged: d.last_changed,
  }));
}

// ─── Seed Devices ───
const rooms = ["Drawing Room", "Work Room 1", "Work Room 2"];
const existing = db.prepare("SELECT COUNT(*) as cnt FROM devices").get();
if (existing.cnt === 0) {
  let counter = 1;
  const insert = db.prepare("INSERT INTO devices (id, name, room, type, status, power_draw, last_changed) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const tx = db.transaction(() => {
    rooms.forEach((room) => {
      for (let i = 1; i <= 3; i++) {
        insert.run(`light_${counter}`, `Light ${i}`, room, "light", "off", 15, new Date().toISOString());
        counter++;
      }
      for (let i = 1; i <= 2; i++) {
        insert.run(`fan_${counter}`, `Fan ${i}`, room, "fan", "off", 60, new Date().toISOString());
        counter++;
      }
    });
  });
  tx();
  console.log(`Seeded ${counter - 1} devices`);
}

let devices = getDevices();

// ─── Usage Tracking ───
let usageHistory = { totalKwh: 0, lastUpdateTime: Date.now(), lastTotalWatts: 0 };

const lastUsage = db.prepare("SELECT total_kwh FROM usage_tracking ORDER BY id DESC LIMIT 1").get();
if (lastUsage) {
  usageHistory.totalKwh = lastUsage.total_kwh;
}

function updateUsage() {
  const now = Date.now();
  const elapsedHours = (now - usageHistory.lastUpdateTime) / 3600000;
  if (elapsedHours > 0) {
    const kwhUsed = (usageHistory.lastTotalWatts * elapsedHours) / 1000;
    usageHistory.totalKwh += kwhUsed;
  }
  usageHistory.lastUpdateTime = now;
  usageHistory.lastTotalWatts = devices.reduce((s, d) => s + d.currentPower, 0);
}

function persistUsage() {
  db.prepare("INSERT INTO usage_tracking (total_kwh, recorded_at) VALUES (?, ?)").run(usageHistory.totalKwh, new Date().toISOString());
  // Keep only last 30 days
  db.prepare("DELETE FROM usage_tracking WHERE recorded_at < datetime('now', '-30 days')").run();
}

// Persist usage
setInterval(() => { updateUsage(); persistUsage(); }, 10000);

// ─── Manual Toggle ───
function toggleDevice(id) {
  const device = devices.find(d => d.id === id);
  if (!device) return null;

  const newStatus = device.status === "on" ? "off" : "on";
  device.status = newStatus;
  device.currentPower = newStatus === "on" ? device.powerDrawWhenOn : 0;
  device.lastChanged = new Date().toISOString();

  // DB
  upsertStmt.run(device.id, device.name, device.room, device.type, device.status, device.powerDrawWhenOn, device.lastChanged);
  insertLog.run(device.id, newStatus === "on" ? "turned_on" : "turned_off", device.lastChanged);

  updateUsage();
  devices = getDevices();
  runAlertCheck();
  return device;
}



// ─── Alert Engine ───
let alerts = [];
let alertIdCounter = 1;

function checkAfterHours() {
  const hour = new Date().getHours();
  if (hour < 9 || hour >= 17) {
    devices.filter(d => d.status === "on").forEach(d => {
      const exists = alerts.find(a => a.deviceId === d.id && !a.resolved && a.type === "after-hours");
      if (!exists) {
        alerts.push({ id: alertIdCounter++, deviceId: d.id, message: `${d.name} (${d.room}) is ON after office hours!`, timestamp: new Date().toISOString(), resolved: false, type: "after-hours" });
      }
    });
  }
}

function checkLongOn() {
  const now = Date.now();
  devices.filter(d => d.status === "on").forEach(d => {
    const changed = new Date(d.lastChanged).getTime();
    const hoursOn = (now - changed) / 3600000;
    if (hoursOn > 2) {
      const exists = alerts.find(a => a.deviceId === d.id && !a.resolved && a.type === "long-on");
      if (!exists) {
        alerts.push({ id: alertIdCounter++, deviceId: d.id, message: `${d.name} (${d.room}) has been ON for ${hoursOn.toFixed(1)} hours!`, timestamp: new Date().toISOString(), resolved: false, type: "long-on" });
      }
    }
  });
}

function resolveResolvedAlerts() {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 17) {
    alerts.filter(a => a.type === "after-hours" && !a.resolved).forEach(a => {
      const device = devices.find(d => d.id === a.deviceId);
      if (!device || device.status === "off") a.resolved = true;
    });
  }
  alerts.filter(a => a.type === "long-on" && !a.resolved).forEach(a => {
    const device = devices.find(d => d.id === a.deviceId);
    if (!device || device.status === "off") a.resolved = true;
  });
}

function runAlertCheck() {
  const prevAlertCount = alerts.filter(a => !a.resolved).length;
  checkAfterHours();
  checkLongOn();
  resolveResolvedAlerts();
  const newAlerts = alerts.filter(a => !a.resolved && a.id > (alerts._lastPushedId || 0));
  alerts._lastPushedId = alerts.filter(a => !a.resolved).reduce((max, a) => Math.max(max, a.id), 0);
  newAlerts.forEach(a => io.emit("new_alert", a));
  if (alerts.filter(a => !a.resolved).length !== prevAlertCount) {
    io.emit("alerts_update", alerts.filter(a => !a.resolved));
  }
}

setInterval(runAlertCheck, 5000);

// ─── REST API ───

app.get("/api/devices", (req, res) => {
  devices = getDevices();
  res.json(devices);
});

app.get("/api/devices/room/:room", (req, res) => {
  const roomName = req.params.room.replace(/[-_]/g, " ");
  const matched = devices.filter(d => d.room.toLowerCase() === roomName.toLowerCase());
  if (matched.length === 0) return res.status(404).json({ error: "Room not found" });
  res.json(matched);
});

app.post("/api/devices/:id/toggle", (req, res) => {
  const result = toggleDevice(req.params.id);
  if (!result) return res.status(404).json({ error: "Device not found" });
  devices = getDevices();
  io.emit("device_update", devices);
  io.emit("usage_update", getUsageData());
  res.json(result);
});

app.get("/api/usage", (req, res) => {
  updateUsage();
  res.json(getUsageData());
});

function getUsageData() {
  const totalPower = devices.reduce((s, d) => s + d.currentPower, 0);
  const roomBreakdown = {};
  rooms.forEach((room) => {
    const rd = devices.filter(d => d.room === room);
    roomBreakdown[room] = {
      totalPower: rd.reduce((s, d) => s + d.currentPower, 0),
      lightsOn: rd.filter(d => d.type === "light" && d.status === "on").length,
      fansOn: rd.filter(d => d.type === "fan" && d.status === "on").length,
    };
  });
  return {
    totalPowerWatts: totalPower,
    totalPowerKw: parseFloat((totalPower / 1000).toFixed(2)),
    estimatedKwhToday: parseFloat(usageHistory.totalKwh.toFixed(3)),
    rooms: roomBreakdown,
    timestamp: new Date().toISOString(),
  };
}

app.get("/api/alerts", (req, res) => {
  res.json(alerts.filter(a => !a.resolved));
});

app.get("/api/logs", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const logs = db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT ?").all(limit);
  res.json(logs);
});

// ─── Socket.IO ───
io.on("connection", (socket) => {
  console.log("Dashboard connected");
  devices = getDevices();
  socket.emit("device_update", devices);
  socket.emit("usage_update", getUsageData());
  socket.emit("alerts_update", alerts.filter(a => !a.resolved));
});

// ─── Start ───
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
