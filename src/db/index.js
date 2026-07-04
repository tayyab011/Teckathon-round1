const Database = require("better-sqlite3");
const path = require("path");
const config = require("../config");
const { DEVICE_SEED_CONFIG } = require("../config/constants");

let db;

function getDb() {
  if (!db) {
    const dbPath = path.resolve(__dirname, "../..", config.db.path);
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    seedDevices();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      room TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('light','fan')),
      status TEXT NOT NULL DEFAULT 'off' CHECK(status IN ('on','off')),
      power_draw INTEGER NOT NULL,
      uptime_seconds REAL NOT NULL DEFAULT 0,
      runtime_seconds REAL NOT NULL DEFAULT 0,
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
      cost REAL NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'warning',
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_logs_device_id ON logs(device_id);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_usage_recorded_at ON usage_tracking(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
    CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
  `);
}

function seedDevices() {
  const existing = db.prepare("SELECT COUNT(*) as cnt FROM devices").get();
  if (existing.cnt > 0) return;

  const insert = db.prepare(
    `INSERT INTO devices (id, name, room, type, status, power_draw, uptime_seconds, runtime_seconds, last_changed)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`
  );

  const tx = db.transaction(() => {
    let counter = 1;
    const { rooms, lightsPerRoom, fansPerRoom, lightPower, fanPower } = DEVICE_SEED_CONFIG;
    const now = new Date().toISOString();

    rooms.forEach((room) => {
      for (let i = 1; i <= lightsPerRoom; i++) {
        insert.run(`light_${counter}`, `Light ${i}`, room, "light", "off", lightPower, now);
        counter++;
      }
      for (let i = 1; i <= fansPerRoom; i++) {
        insert.run(`fan_${counter}`, `Fan ${i}`, room, "fan", "off", fanPower, now);
        counter++;
      }
    });
  });

  tx();
}

module.exports = { getDb };
