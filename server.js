const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Dashboard যেন যেকোনো পোর্ট থেকে কানেক্ট করতে পারে
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;

app.use(cors());
app.use(express.json());
// Dashboard এর HTML ফাইল serve করার জন্য (এখনই বানাবেন)
app.use(express.static("public"));

// ---------- ১. ডিভাইসের ডাটা ----------
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

console.log(`✅ মোট ${devices.length} টি ডিভাইস সিমুলেট করা হচ্ছে।`);

// ---------- ২. ডিভাইস টগল ও ব্রডকাস্ট ফাংশন ----------
function toggleDevices() {
  const numChanges = Math.floor(Math.random() * 3) + 1;
  const shuffled = devices.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numChanges);

  selected.forEach((device) => {
    const newStatus = device.status === "on" ? "off" : "on";
    device.status = newStatus;
    device.currentPower = newStatus === "on" ? device.powerDrawWhenOn : 0;
    device.lastChanged = new Date().toISOString();
    console.log(
      `🔄 ${device.name} (${device.room}) -> ${newStatus.toUpperCase()}`,
    );
  });

  // 🔥 সব কানেক্টেড ক্লায়েন্টকে (Dashboard) আপডেট পাঠান
  io.emit("device_update", devices);
}

// প্রতি ৫-১০ সেকেন্ড পর পর টগল হবে
setInterval(toggleDevices, Math.floor(Math.random() * 5000) + 5000);

// ---------- ৩. API (পূর্বের মতো) ----------
app.get("/api/devices", (req, res) => res.json(devices));

app.get("/api/summary", (req, res) => {
  let totalPower = 0;
  const roomBreakdown = {};
  rooms.forEach((room) => {
    const roomDevices = devices.filter((d) => d.room === room);
    const roomPower = roomDevices.reduce((sum, d) => sum + d.currentPower, 0);
    roomBreakdown[room] = {
      totalPower: roomPower,
      lightsOn: roomDevices.filter(
        (d) => d.type === "light" && d.status === "on",
      ).length,
      fansOn: roomDevices.filter((d) => d.type === "fan" && d.status === "on")
        .length,
    };
    totalPower += roomPower;
  });
  res.json({
    totalPowerWatts: totalPower,
    totalPowerKw: parseFloat((totalPower / 1000).toFixed(2)),
    rooms: roomBreakdown,
    timestamp: new Date().toISOString(),
  });
});

// ---------- ৪. Socket.IO কানেকশন ----------
io.on("connection", (socket) => {
  console.log("✅ Dashboard কানেক্ট হয়েছে!");
  // কানেক্ট হওয়ার সাথে সাথে বর্তমান ডাটা পাঠান
  socket.emit("device_update", devices);
});

// সার্ভার চালু
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server চালু: http://localhost:${PORT}`);
});
