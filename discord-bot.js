require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ALERTS_CHANNEL_ID = process.env.ALERTS_CHANNEL_ID;

if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN is required. Set it in env or .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const ROOM_SYNONYMS = {
  "drawing room": "Drawing Room", drawing: "Drawing Room",
  "work room 1": "Work Room 1", work1: "Work Room 1", "work 1": "Work Room 1",
  "work room 2": "Work Room 2", work2: "Work Room 2", "work 2": "Work Room 2",
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

function coloredEmbed(title, color, description) {
  return new EmbedBuilder().setTitle(title).setColor(color).setDescription(description).setTimestamp();
}

const COMMANDS = {
  async status(message) {
    const data = await apiFetch("/api/usage");
    const embed = new EmbedBuilder()
      .setTitle("Office Status")
      .setColor(0x34d399)
      .setTimestamp();

    let totalActive = 0;
    for (const [room, info] of Object.entries(data.rooms)) {
      const active = info.lightsOn + info.fansOn;
      totalActive += active;
      embed.addFields({
        name: room,
        value: `🟢 ${active} active · ${info.totalPower}W\n${info.lightsOn} lights · ${info.fansOn} fans`,
        inline: true,
      });
    }

    embed.addFields({
      name: "Total",
      value: `**${data.totalPowerWatts}W** (${data.totalPowerKw} kW) · ${totalActive} devices active`,
    });

    message.reply({ embeds: [embed] });
  },

  async room(message, args) {
    if (args.length === 0) {
      const valid = Object.keys(ROOM_SYNONYMS).slice(0, 6).join(", ");
      return message.reply({ embeds: [coloredEmbed("Usage", 0xfbbf24, `\`!room <name>\`\n\nTry: ${valid}`)] });
    }
    const roomName = resolveRoom(args.join(" "));
    if (!roomName) {
      return message.reply({ embeds: [coloredEmbed("Room Not Found", 0xf87171, `Unknown room. Try: ${Object.keys(ROOM_SYNONYMS).slice(0, 6).join(", ")}`)] });
    }
    const devices = await apiFetch(`/api/devices/room/${encodeURIComponent(roomName)}`);
    const embed = new EmbedBuilder().setTitle(roomName).setColor(0x60d0ff).setTimestamp();

    devices.forEach((d) => {
      const status = d.status === "on" ? "🟢 ON" : "🔴 OFF";
      const power = d.currentPower;
      embed.addFields({ name: `${d.name} (${d.type})`, value: `${status} · ${power}W`, inline: true });
    });

    const totalPower = devices.reduce((s, d) => s + d.currentPower, 0);
    embed.setFooter({ text: `Total: ${totalPower}W` });
    message.reply({ embeds: [embed] });
  },

  async usage(message) {
    const data = await apiFetch("/api/usage");
    const dailyKwh = data.estimatedKwhToday || 0;
    const monthlyKwh = (dailyKwh * 30).toFixed(1);
    const monthlyCost = (dailyKwh * 30 * 0.12).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle("Power Usage")
      .setColor(0x5e9eff)
      .addFields(
        { name: "Current", value: `**${data.totalPowerWatts}W** (${data.totalPowerKw} kW)`, inline: true },
        { name: "Today (est.)", value: `**${dailyKwh.toFixed(3)} kWh**`, inline: true },
        { name: "Monthly (proj.)", value: `**${monthlyKwh} kWh** · $${monthlyCost}`, inline: true },
      )
      .setTimestamp();

    for (const [r, i] of Object.entries(data.rooms)) {
      embed.addFields({ name: r, value: `${i.totalPower}W · ${i.lightsOn} lights · ${i.fansOn} fans`, inline: true });
    }

    message.reply({ embeds: [embed] });
  },

  async alerts(message) {
    const alerts = await apiFetch("/api/alerts");
    if (alerts.length === 0) {
      return message.reply({ embeds: [coloredEmbed("Alerts", 0x34d399, "✅ No active alerts. All clear!")] });
    }
    const embed = new EmbedBuilder().setTitle(`Alerts (${alerts.length})`).setColor(0xf87171).setTimestamp();
    alerts.forEach((a) => {
      const color = a.severity === "critical" ? "🔴" : "🟡";
      embed.addFields({ name: `${color} ${a.type}`, value: a.message, inline: false });
    });
    message.reply({ embeds: [embed] });
  },

  async history(message, args) {
    const limit = Math.min(parseInt(args[0], 10) || 10, 50);
    const logs = await apiFetch(`/api/logs?limit=${limit}`);
    const embed = new EmbedBuilder()
      .setTitle(`Recent Activity (last ${limit})`)
      .setColor(0xa78bfa)
      .setTimestamp();
    const lines = logs.map((l) => `\`${new Date(l.timestamp).toLocaleTimeString()}\` **${l.device_id}** ${l.action}`).join("\n");
    embed.setDescription(lines || "No activity recorded.");
    message.reply({ embeds: [embed] });
  },

  async devices(message) {
    const devices = await apiFetch("/api/devices");
    const onCount = devices.filter((d) => d.status === "on").length;
    const offCount = devices.length - onCount;
    const totalPower = devices.reduce((s, d) => s + d.currentPower, 0);
    const embed = new EmbedBuilder()
      .setTitle("All Devices")
      .setColor(0x34d399)
      .addFields(
        { name: "Total", value: `${devices.length} devices`, inline: true },
        { name: "Active", value: `🟢 ${onCount}`, inline: true },
        { name: "Inactive", value: `🔴 ${offCount}`, inline: true },
        { name: "Total Power", value: `${totalPower}W`, inline: true },
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },

  async toproom(message) {
    const data = await apiFetch("/api/usage");
    const rooms = Object.entries(data.rooms);
    rooms.sort((a, b) => b[1].totalPower - a[1].totalPower);
    const embed = new EmbedBuilder().setTitle("Room Comparison").setColor(0xfbbf24).setTimestamp();
    rooms.forEach(([r, i], idx) => {
      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
      embed.addFields({ name: `${medal} ${r}`, value: `${i.totalPower}W · ${i.lightsOn} lights · ${i.fansOn} fans`, inline: true });
    });
    message.reply({ embeds: [embed] });
  },

  async powergraph(message) {
    const data = await apiFetch("/api/usage/history?days=1");
    if (!data.length) {
      return message.reply({ embeds: [coloredEmbed("Power Graph", 0xf87171, "No historical data available yet.")] });
    }
    const max = Math.max(...data.map((d) => d.kwh));
    const bars = data.map((d) => {
      const pct = max > 0 ? (d.kwh / max) * 20 : 0;
      const bar = "█".repeat(Math.round(pct));
      return `${bar} ${d.kwh.toFixed(2)} kWh`;
    }).join("\n");
    const embed = new EmbedBuilder()
      .setTitle("Power History (24h)")
      .setColor(0x5e9eff)
      .setDescription(`\`\`\`${bars}\`\`\``)
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },

  async help(message) {
    const embed = new EmbedBuilder()
      .setTitle("Office Bot Commands")
      .setColor(0x34d399)
      .setDescription("Control and monitor your office from Discord")
      .addFields(
        { name: "!status", value: "Show all rooms with device counts and total power", inline: true },
        { name: "!room <name>", value: "Show devices in a specific room", inline: true },
        { name: "!usage", value: "Show power consumption breakdown", inline: true },
        { name: "!alerts", value: "List all active alerts", inline: true },
        { name: "!history [N]", value: "Show last N activity log entries", inline: true },
        { name: "!devices", value: "Show summary of all devices", inline: true },
        { name: "!toproom", value: "Rank rooms by power usage", inline: true },
        { name: "!powergraph", value: "Show ASCII power history graph", inline: true },
        { name: "!help", value: "Show this command list", inline: true },
      )
      .setFooter({ text: "Room aliases: drawing, work1, work2" })
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

const sentAlertIds = new Set();

async function pollAlerts() {
  if (!ALERTS_CHANNEL_ID) return;
  try {
    const alerts = await apiFetch("/api/alerts");
    for (const a of alerts) {
      if (!sentAlertIds.has(a.id)) {
        sentAlertIds.add(a.id);
        const channel = client.channels.cache.get(ALERTS_CHANNEL_ID);
        if (channel) {
          const color = a.severity === "critical" ? 0xf87171 : 0xfbbf24;
          const embed = new EmbedBuilder()
            .setTitle(`🚨 ${a.type.replace("-", " ").toUpperCase()}`)
            .setColor(color)
            .setDescription(a.message)
            .setTimestamp();
          channel.send({ embeds: [embed] });
        }
      }
    }
  } catch {
    // silently retry
  }
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const [cmd, ...args] = message.content.slice(1).split(/\s+/);
  const handler = COMMANDS[cmd.toLowerCase()];
  if (handler) {
    handler(message, args).catch((err) => {
      message.reply({ embeds: [new EmbedBuilder().setTitle("Error").setColor(0xf87171).setDescription(`Could not execute command: ${err.message}`)] });
    });
  }
});

client.once("ready", () => {
  console.log(`[Discord] Logged in as ${client.user.tag}`);
  if (ALERTS_CHANNEL_ID) {
    setInterval(pollAlerts, 30000);
    console.log("[Discord] Proactive alert polling started.");
  }
});

client.login(TOKEN);
