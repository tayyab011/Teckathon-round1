const { getDb } = require("../db");
const config = require("../config");
const { USAGE_RETENTION_DAYS } = require("../config/constants");
const deviceService = require("./deviceService");

let usageHistory = {
  totalKwh: 0,
  totalCost: 0,
  lastUpdateTime: Date.now(),
  lastTotalWatts: 0,
};

function init() {
  const lastUsage = getDb()
    .prepare("SELECT total_kwh, cost FROM usage_tracking ORDER BY id DESC LIMIT 1")
    .get();
  if (lastUsage) {
    usageHistory.totalKwh = lastUsage.total_kwh;
    usageHistory.totalCost = lastUsage.cost || 0;
  }
}

function update() {
  const now = Date.now();
  const elapsedHours = (now - usageHistory.lastUpdateTime) / 3600000;
  if (elapsedHours > 0) {
    const devices = deviceService.getAll();
    const totalWatts = devices.reduce((s, d) => s + d.currentPower, 0);
    const kwhUsed = (totalWatts * elapsedHours) / 1000;
    usageHistory.totalKwh += kwhUsed;
    usageHistory.totalCost += kwhUsed * config.energy.costPerKwh;
    usageHistory.lastUpdateTime = now;
    usageHistory.lastTotalWatts = totalWatts;
  }
}

function persist() {
  const now = new Date().toISOString();
  getDb()
    .prepare("INSERT INTO usage_tracking (total_kwh, cost, recorded_at) VALUES (?, ?, ?)")
    .run(usageHistory.totalKwh, usageHistory.totalCost, now);
  getDb()
    .prepare(
      `DELETE FROM usage_tracking WHERE recorded_at < datetime('now', '-${USAGE_RETENTION_DAYS} days')`
    )
    .run();
}

function getCurrentData() {
  update();
  const devices = deviceService.getAll();
  const totalPower = devices.reduce((s, d) => s + d.currentPower, 0);
  const rooms = {};
  const roomSet = [...new Set(devices.map((d) => d.room))];
  roomSet.forEach((room) => {
    const rd = devices.filter((d) => d.room === room);
    rooms[room] = {
      totalPower: rd.reduce((s, d) => s + d.currentPower, 0),
      lightsOn: rd.filter((d) => d.type === "light" && d.status === "on").length,
      fansOn: rd.filter((d) => d.type === "fan" && d.status === "on").length,
      deviceCount: rd.length,
      activeDevices: rd.filter((d) => d.status === "on").length,
    };
  });

  return {
    totalPowerWatts: totalPower,
    totalPowerKw: parseFloat((totalPower / 1000).toFixed(2)),
    estimatedKwhToday: parseFloat(usageHistory.totalKwh.toFixed(3)),
    estimatedCostToday: parseFloat(usageHistory.totalCost.toFixed(2)),
    estimatedMonthlyCost: parseFloat((usageHistory.totalCost * 30).toFixed(2)),
    rooms,
    timestamp: new Date().toISOString(),
  };
}

function getHistorical(days = 7) {
  const rows = getDb()
    .prepare(
      "SELECT total_kwh, cost, recorded_at FROM usage_tracking WHERE recorded_at >= datetime('now', ?) ORDER BY recorded_at"
    )
    .all(`-${days} days`);
  return rows.map((r) => ({
    kwh: r.total_kwh,
    cost: r.cost,
    timestamp: r.recorded_at,
  }));
}

function getDailyTotals(days = 30) {
  const rows = getDb()
    .prepare(
      `SELECT DATE(recorded_at) as day, MAX(total_kwh) as kwh, MAX(cost) as cost
       FROM usage_tracking
       WHERE recorded_at >= datetime('now', ?)
       GROUP BY DATE(recorded_at)
       ORDER BY day`
    )
    .all(`-${days} days`);
  return rows.map((r) => ({
    day: r.day,
    kwh: r.kwh,
    cost: r.cost,
  }));
}

module.exports = { init, update, persist, getCurrentData, getHistorical, getDailyTotals };
