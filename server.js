require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---------- 1. Device Data ----------
const rooms = ["Drawing Room", "Work Room 1", "Work Room 2"];
let devices = [];
let deviceIdCounter = 1;

rooms.forEach((room) => {
  for (let i = 1; i <= 3; i++) {
    devices.push({
      id: `light_${deviceIdCounter}`,
      name: `Light ${i}`,
      room: room,
      type: "light",
      status: "off",
      powerDrawWhenOn: 15,
      currentPower: 0,
      lastChanged: new Date().toISOString(),
    });
    deviceIdCounter++;
  }
  for (let i = 1; i <= 2; i++) {
    devices.push({
      id: `fan_${deviceIdCounter}`,
      name: `Fan ${i}`,
      room: room,
      type: "fan",
      status: "off",
      powerDrawWhenOn: 60,
      currentPower: 0,
      lastChanged: new Date().toISOString(),
    });
    deviceIdCounter++;
  }
});

console.log(`Total devices simulated: ${devices.length}`);

// ---------- 2. Usage Tracking (kWh estimation) ----------
let usageHistory = { totalKwh: 0, lastUpdateTime: Date.now(), lastTotalWatts: 0 };

function updateUsage() {
  const now = Date.now();
  const elapsedHours = (now - usageHistory.lastUpdateTime) / 3600000;
  if (elapsedHours > 0) {
    const kwhUsed = (usageHistory.lastTotalWatts * elapsedHours) / 1000;
    usageHistory.totalKwh += kwhUsed;
  }
  usageHistory.lastUpdateTime = now;
  usageHistory.lastTotalWatts = devices.reduce((sum, d) => sum + d.currentPower, 0);
}

// ---------- 3. Device Toggle & Broadcast ----------
function toggleDevices() {
  updateUsage();
  const numChanges = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...devices].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numChanges);

  selected.forEach((device) => {
    const newStatus = device.status === "on" ? "off" : "on";
    device.status = newStatus;
    device.currentPower = newStatus === "on" ? device.powerDrawWhenOn : 0;
    device.lastChanged = new Date().toISOString();
    console.log(`${device.name} (${device.room}) -> ${newStatus.toUpperCase()}`);
  });

  updateUsage();
  io.emit("device_update", devices);
  io.emit("usage_update", getUsageData());
}

setInterval(toggleDevices, Math.floor(Math.random() * 5000) + 5000);

// ---------- 4. Alert Engine ----------
let alerts = [];
let alertIdCounter = 1;

function checkAfterHours() {
  const hour = new Date().getHours();
  if (hour < 9 || hour >= 17) {
    devices.filter(d => d.status === "on").forEach(d => {
      const exists = alerts.find(a => a.message.includes(d.id) && !a.resolved && a.type === "after-hours");
      if (!exists) {
        alerts.push({
          id: alertIdCounter++,
          message: `${d.name} (${d.room}) is ON after office hours!`,
          timestamp: new Date().toISOString(),
          resolved: false,
          type: "after-hours",
        });
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
      const exists = alerts.find(a => a.message.includes(d.id) && !a.resolved && a.type === "long-on");
      if (!exists) {
        alerts.push({
          id: alertIdCounter++,
          message: `${d.name} (${d.room}) has been ON for ${hoursOn.toFixed(1)} hours!`,
          timestamp: new Date().toISOString(),
          resolved: false,
          type: "long-on",
        });
      }
    }
  });
}

function resolveResolvedAlerts() {
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 17) {
    alerts.filter(a => a.type === "after-hours" && !a.resolved).forEach(a => {
      const deviceOn = devices.some(d => d.status === "on" && a.message.includes(d.id));
      if (!deviceOn) {
        a.resolved = true;
      }
    });
  }

  alerts.filter(a => a.type === "long-on" && !a.resolved).forEach(a => {
    const device = devices.find(d => a.message.includes(d.id));
    if (!device || device.status === "off") {
      a.resolved = true;
    }
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

setInterval(runAlertCheck, 30000);

// ---------- 5. REST API Endpoints ----------

app.get("/api/devices", (req, res) => res.json(devices));

app.get("/api/devices/room/:room", (req, res) => {
  const roomName = req.params.room.replace(/[-_]/g, " ");
  const matched = devices.filter(d => d.room.toLowerCase() === roomName.toLowerCase());
  if (matched.length === 0) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(matched);
});

app.get("/api/usage", (req, res) => {
  updateUsage();
  res.json(getUsageData());
});

function getUsageData() {
  const totalPower = devices.reduce((sum, d) => sum + d.currentPower, 0);
  const roomBreakdown = {};
  rooms.forEach((room) => {
    const roomDevices = devices.filter(d => d.room === room);
    const roomPower = roomDevices.reduce((sum, d) => sum + d.currentPower, 0);
    roomBreakdown[room] = {
      totalPower: roomPower,
      lightsOn: roomDevices.filter(d => d.type === "light" && d.status === "on").length,
      fansOn: roomDevices.filter(d => d.type === "fan" && d.status === "on").length,
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
  const active = alerts.filter(a => !a.resolved);
  res.json(active);
});

// ---------- 6. Socket.IO Connection ----------
io.on("connection", (socket) => {
  console.log("Dashboard connected!");
  socket.emit("device_update", devices);
  socket.emit("usage_update", getUsageData());
  socket.emit("alerts_update", alerts.filter(a => !a.resolved));
});

// ---------- 7. Start Server ----------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
