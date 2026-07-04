const { getDb } = require("../db");
const config = require("../config");
const { ALERT_TYPES } = require("../config/constants");
const deviceService = require("./deviceService");

function getActive() {
  return getDb()
    .prepare("SELECT * FROM alerts WHERE resolved = 0 ORDER BY id DESC")
    .all();
}

function getAll() {
  return getDb()
    .prepare("SELECT * FROM alerts ORDER BY id DESC LIMIT 200")
    .all();
}

function create(deviceId, type, message, severity = "warning") {
  const stmt = getDb().prepare(
    "INSERT INTO alerts (device_id, type, message, severity, resolved, created_at) VALUES (?, ?, ?, ?, 0, ?)"
  );
  const result = stmt.run(deviceId, type, message, severity, new Date().toISOString());
  return result.lastInsertRowid;
}

function resolve(id) {
  getDb()
    .prepare("UPDATE alerts SET resolved = 1, resolved_at = ? WHERE id = ? AND resolved = 0")
    .run(new Date().toISOString(), id);
}

function exists(deviceId, type) {
  const row = getDb()
    .prepare("SELECT id FROM alerts WHERE device_id = ? AND type = ? AND resolved = 0 LIMIT 1")
    .get(deviceId, type);
  return !!row;
}

function resolveByDevice(deviceId) {
  getDb()
    .prepare(
      "UPDATE alerts SET resolved = 1, resolved_at = ? WHERE device_id = ? AND resolved = 0"
    )
    .run(new Date().toISOString(), deviceId);
}

function runChecks(io) {
  const devices = deviceService.getAll();
  const hour = new Date().getHours();
  const now = Date.now();
  let alertCountBefore = getActive().length;

  checkAfterHours(devices, hour);
  checkLongOn(devices, now);
  resolveResolvedAlerts(devices, hour);
  checkPowerAnomalies(devices);

  const currentAlerts = getActive();
  if (currentAlerts.length !== alertCountBefore) {
    io.emit("alerts_update", currentAlerts);
  }

  const lastId = runChecks._lastId || 0;
  const newAlerts = currentAlerts.filter((a) => a.id > lastId);
  if (newAlerts.length > 0) {
    runChecks._lastId = Math.max(...currentAlerts.map((a) => a.id));
    newAlerts.forEach((a) => io.emit("new_alert", a));
  }
}

function checkAfterHours(devices, hour) {
  if (hour < config.simulation.businessHourStart || hour >= config.simulation.businessHourEnd) {
    devices
      .filter((d) => d.status === "on")
      .forEach((d) => {
        if (!exists(d.id, ALERT_TYPES.AFTER_HOURS)) {
          create(
            d.id,
            ALERT_TYPES.AFTER_HOURS,
            `${d.name} (${d.room}) is ON after office hours!`,
            "warning"
          );
        }
      });
  }
}

function checkLongOn(devices, now) {
  const thresholdMs = config.alerts.longOnThresholdHours * 3600000;
  devices
    .filter((d) => d.status === "on")
    .forEach((d) => {
      const changed = new Date(d.lastChanged).getTime();
      const hoursOn = (now - changed) / 3600000;
      if (hoursOn > config.alerts.longOnThresholdHours && !exists(d.id, ALERT_TYPES.LONG_ON)) {
        create(
          d.id,
          ALERT_TYPES.LONG_ON,
          `${d.name} (${d.room}) has been ON for ${hoursOn.toFixed(1)} hours!`,
          hoursOn > 4 ? "critical" : "warning"
        );
      }
    });
}

function resolveResolvedAlerts(devices, hour) {
  const isBusinessHours =
    hour >= config.simulation.businessHourStart && hour < config.simulation.businessHourEnd;

  const activeAlerts = getActive();
  activeAlerts.forEach((a) => {
    if (a.type === ALERT_TYPES.AFTER_HOURS && isBusinessHours) {
      const device = devices.find((d) => d.id === a.device_id);
      if (!device || device.status === "off") resolve(a.id);
    }
    if (a.type === ALERT_TYPES.LONG_ON) {
      const device = devices.find((d) => d.id === a.device_id);
      if (!device || device.status === "off") resolve(a.id);
    }
  });
}

function checkPowerAnomalies(devices) {
  const activeDevices = devices.filter((d) => d.status === "on");
  const totalPower = activeDevices.reduce((s, d) => s + d.currentPower, 0);
  const maxDraw = devices.reduce((s, d) => s + d.powerDrawWhenOn, 0);

  if (totalPower > maxDraw * 0.8 && !exists("system", ALERT_TYPES.POWER_SPIKE)) {
    create(
      "system",
      ALERT_TYPES.POWER_SPIKE,
      `High power draw detected: ${totalPower}W (${(totalPower / maxDraw * 100).toFixed(0)}% of max)`,
      "critical"
    );
  }
}

module.exports = {
  getActive,
  getAll,
  create,
  resolve,
  runChecks,
};
