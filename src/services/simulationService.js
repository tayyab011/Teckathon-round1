const config = require("../config");
const deviceService = require("./deviceService");
const usageService = require("./usageService");
const { getDb } = require("../db");

let simulationTimer = null;
let isRunning = false;

function start() {
  if (!config.simulation.enabled || isRunning) return;
  isRunning = true;
  console.log("[Simulation] Engine started");
  runCycle();
}

function stop() {
  if (simulationTimer) clearTimeout(simulationTimer);
  isRunning = false;
  console.log("[Simulation] Engine stopped");
}

function runCycle() {
  if (!isRunning) return;

  try {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    const minute = now.getMinutes();
    const devices = deviceService.getAll();

    updateRuntimeTracking(devices, now);

    if (isWeekend) {
      weekendBehavior(devices);
    } else {
      const elapsed = (hour * 60 + minute);
      const morningEnd = config.simulation.businessHourStart * 60;
      const lunchStart = 12 * 60;
      const lunchEnd = 13 * 60;
      const eveningStart = config.simulation.businessHourEnd * 60;

      if (elapsed >= morningEnd && elapsed < lunchStart) {
        morningBehavior(devices);
      } else if (elapsed >= lunchStart && elapsed < lunchEnd) {
        lunchBehavior(devices);
      } else if (elapsed >= lunchEnd && elapsed < eveningStart) {
        afternoonBehavior(devices);
      } else if (elapsed >= eveningStart) {
        eveningBehavior(devices);
      } else {
        nightBehavior(devices);
      }
    }

    maybeRandomMistake(devices);
    maybeForgottenDevice(devices, now);

    deviceService.getAll();
    usageService.update();
  } catch (err) {
    console.error("[Simulation] Error:", err.message);
  }

  simulationTimer = setTimeout(runCycle, config.simulation.simulationIntervalMs);
}

function updateRuntimeTracking(devices, now) {
  devices.forEach((d) => {
    if (d.status === "on") {
      d.uptimeSeconds = (d.uptimeSeconds || 0) + config.simulation.simulationIntervalMs / 1000;
      d.runtimeSeconds = (d.runtimeSeconds || 0) + config.simulation.simulationIntervalMs / 1000;
    }
    deviceService.updateRuntime(d.id, d.uptimeSeconds || 0, d.runtimeSeconds || 0);
  });
}

function morningBehavior(devices) {
  devices.forEach((d) => {
    if (d.status === "off" && Math.random() < 0.08) {
      deviceService.toggle(d.id);
    }
  });
}

function lunchBehavior(devices) {
  devices.forEach((d) => {
    if (d.type === "light" && d.status === "on" && Math.random() < 0.1) {
      deviceService.toggle(d.id);
    }
  });
}

function afternoonBehavior(devices) {
  const arrivalPhase = Math.random();
  if (arrivalPhase > 0.7) {
    devices.forEach((d) => {
      if (d.status === "off" && Math.random() < 0.03) {
        deviceService.toggle(d.id);
      }
    });
  }
}

function eveningBehavior(devices) {
  devices.forEach((d) => {
    if (d.status === "on" && Math.random() < 0.15) {
      deviceService.toggle(d.id);
    }
  });
}

function nightBehavior(devices) {
  if (Math.random() > 0.1) return;
  devices.forEach((d) => {
    if (d.status === "on" && Math.random() < 0.3) {
      deviceService.toggle(d.id);
    }
  });
}

function weekendBehavior(devices) {
  if (Math.random() > 0.05) return;
  devices.forEach((d) => {
    if (d.status === "on" && Math.random() < 0.1) {
      deviceService.toggle(d.id);
    }
  });
}

function maybeRandomMistake(devices) {
  if (Math.random() > 0.05) return;
  const device = devices[Math.floor(Math.random() * devices.length)];
  if (device.status === "off") {
    deviceService.toggle(device.id);
    setTimeout(() => {
      const d = deviceService.getById(device.id);
      if (d && d.status === "on") deviceService.toggle(device.id);
    }, 60000);
  }
}

function maybeForgottenDevice(devices, now) {
  const hour = now.getHours();
  if (hour >= config.simulation.businessHourEnd && Math.random() < 0.03) {
    devices.forEach((d) => {
      if (d.status === "on" && Math.random() < 0.2) {
        setTimeout(() => deviceService.toggle(d.id), 120000);
      }
    });
  }
}

module.exports = { start, stop };
