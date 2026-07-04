const deviceService = require("../services/deviceService");
const alertService = require("../services/alertService");
const usageService = require("../services/usageService");

function setup(io) {
  io.on("connection", (socket) => {
    console.log(`[WS] Dashboard connected (${socket.id})`);

    socket.emit("device_update", deviceService.getAll());
    socket.emit("usage_update", usageService.getCurrentData());
    socket.emit("alerts_update", alertService.getActive());

    socket.on("disconnect", () => {
      console.log(`[WS] Dashboard disconnected (${socket.id})`);
    });

    socket.on("request_refresh", () => {
      socket.emit("device_update", deviceService.getAll());
      socket.emit("usage_update", usageService.getCurrentData());
      socket.emit("alerts_update", alertService.getActive());
    });
  });

  return io;
}

module.exports = { setup };
