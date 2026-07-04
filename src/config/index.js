require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    alertsChannelId: process.env.ALERTS_CHANNEL_ID,
  },
  simulation: {
    enabled: process.env.SIMULATION_ENABLED !== "false",
    businessHourStart: parseInt(process.env.BUSINESS_HOUR_START, 10) || 9,
    businessHourEnd: parseInt(process.env.BUSINESS_HOUR_END, 10) || 17,
    alertIntervalMs: parseInt(process.env.ALERT_INTERVAL_MS, 10) || 5000,
    usageIntervalMs: parseInt(process.env.USAGE_INTERVAL_MS, 10) || 10000,
    simulationIntervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS, 10) || 30000,
  },
  db: {
    path: process.env.DB_PATH || "./office.db",
  },
  alerts: {
    longOnThresholdHours: parseFloat(process.env.LONG_ON_THRESHOLD_HOURS) || 2,
  },
  energy: {
    costPerKwh: parseFloat(process.env.COST_PER_KWH) || 0.12,
  },
};

module.exports = config;
