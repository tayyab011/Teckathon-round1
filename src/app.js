const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const { getDb } = require("./db");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { setup: setupWebSocket } = require("./websocket");
const alertService = require("./services/alertService");
const usageService = require("./services/usageService");
const simulationService = require("./services/simulationService");

function createApp() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  getDb();
  usageService.init();

  io.set = io.set || function () {};
  app.set("io", io);
  app.set("usageData", () => usageService.getCurrentData());

  app.use("/api", routes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  setupWebSocket(io);

  setInterval(() => {
    alertService.runChecks(io);
  }, config.simulation.alertIntervalMs);

  setInterval(() => {
    usageService.update();
    usageService.persist();
    io.emit("usage_update", usageService.getCurrentData());
  }, config.simulation.usageIntervalMs);

  simulationService.start();

  return { app, server, io };
}

module.exports = { createApp };
