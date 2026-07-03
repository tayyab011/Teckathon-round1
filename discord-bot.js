require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ALERTS_CHANNEL_ID = process.env.ALERTS_CHANNEL_ID;

if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN is required. Set it in env or .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Room synonym map
const ROOM_SYNONYMS = {
  "drawing room": "Drawing Room",
  drawing: "Drawing Room",
  "work room 1": "Work Room 1",
  work1: "Work Room 1",
  "work 1": "Work Room 1",
  "work room 2": "Work Room 2",
  work2: "Work Room 2",
  "work 2": "Work Room 2",
};

function resolveRoom(input) {
  const key = input.toLowerCase().trim();
  return ROOM_SYNONYMS[key] || null;
}

async function apiFetch(path) {
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

// -- Command Handlers --

async function cmdStatus(message) {
  try {
    const data = await apiFetch("/api/usage");
    let reply = "**Office Status**\n\n";
    for (const [room, info] of Object.entries(data.rooms)) {
      reply += `**${room}**\n`;
      reply += `- Lights ON: ${info.lightsOn}\n`;
      reply += `- Fans ON: ${info.fansOn}\n`;
      reply += `- Power: ${info.totalPower}W\n\n`;
    }
    reply += `**Total:** ${data.totalPowerWatts}W (${data.totalPowerKw} kW)`;
    message.reply(reply);
  } catch (err) {
    message.reply("Could not fetch office status. Is the server running?");
  }
}

async function cmdRoom(message, args) {
  if (args.length === 0) {
    return message.reply("Usage: `!room <name>` — e.g., `!room drawing` or `!room work1`");
  }
  const roomName = resolveRoom(args.join(" "));
  if (!roomName) {
    const valid = Object.keys(ROOM_SYNONYMS).slice(0, 5).join(", ");
    return message.reply(`Room not found. Try: ${valid}`);
  }
  try {
    const devices = await apiFetch(`/api/devices/room/${encodeURIComponent(roomName)}`);
    let reply = `**${roomName}**\n\n`;
    devices.forEach(d => {
      const status = d.status === "on" ? "ON" : "OFF";
      reply += `- ${d.name}: ${status} (${d.currentPower}W)\n`;
    });
    const totalPower = devices.reduce((s, d) => s + d.currentPower, 0);
    reply += `\nTotal: ${totalPower}W`;
    message.reply(reply);
  } catch (err) {
    message.reply(`Could not fetch data for "${roomName}". Is the server running?`);
  }
}

async function cmdUsage(message) {
  try {
    const data = await apiFetch("/api/usage");
    const dailyKwh = data.estimatedKwhToday || 0;
    const monthlyKwh = (dailyKwh * 30).toFixed(1);
    message.reply(
      `**Power Usage**\n\n` +
      `Current: **${data.totalPowerWatts}W** (${data.totalPowerKw} kW)\n` +
      `Today (estimated): **${dailyKwh.toFixed(3)} kWh**\n` +
      `Monthly (projected): **${monthlyKwh} kWh**\n\n` +
      `Per room:\n` +
      Object.entries(data.rooms)
        .map(([r, i]) => `- ${r}: ${i.totalPower}W (${i.lightsOn} lights, ${i.fansOn} fans)`)
        .join("\n")
    );
  } catch (err) {
    message.reply("Could not fetch usage data. Is the server running?");
  }
}

// -- Proactive Alerts (bonus) --
const sentAlertIds = new Set();

async function pollAlerts() {
  if (!ALERTS_CHANNEL_ID) return;
  try {
    const alerts = await apiFetch("/api/alerts");
    alerts.forEach(a => {
      if (!sentAlertIds.has(a.id)) {
        sentAlertIds.add(a.id);
        const channel = client.channels.cache.get(ALERTS_CHANNEL_ID);
        if (channel) {
          channel.send(`ALERT: ${a.message}`);
        }
      }
    });
  } catch {
    // silently retry next cycle
  }
}

// -- Message Handler --
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const [cmd, ...args] = message.content.slice(1).split(/\s+/);

  switch (cmd.toLowerCase()) {
    case "status":
      cmdStatus(message);
      break;
    case "room":
      cmdRoom(message, args);
      break;
    case "usage":
      cmdUsage(message);
      break;
    default:
      // ignore unknown commands
      break;
  }
});

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
  if (ALERTS_CHANNEL_ID) {
    setInterval(pollAlerts, 30000);
    console.log("Proactive alert polling started.");
  }
});

client.login(TOKEN);
