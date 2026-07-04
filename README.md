<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Inter&size=28&duration=2000&pause=500&color=34D399&center=true&vCenter=true&width=600&lines=Smart+Office+Energy+Management;Real-Time+Monitoring+%26+Control;Teckathon+Submission" alt="typing header" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-18%2B-34D399?style=flat-square&logo=node.js&logoColor=white" alt="node" />
  <img src="https://img.shields.io/badge/socket.io-realtime-34D399?style=flat-square&logo=socket.io&logoColor=white" alt="socketio" />
  <img src="https://img.shields.io/badge/discord.js-bot-34D399?style=flat-square&logo=discord&logoColor=white" alt="discord" />
  <img src="https://img.shields.io/badge/sqlite-3-34D399?style=flat-square&logo=sqlite&logoColor=white" alt="sqlite" />
  <img src="https://img.shields.io/badge/express-api-34D399?style=flat-square&logo=express&logoColor=white" alt="express" />
  <img src="https://img.shields.io/badge/chart.js-analytics-34D399?style=flat-square&logo=chart.js&logoColor=white" alt="chartjs" />
  <img src="https://img.shields.io/badge/AI-powered-8b5cf6?style=flat-square" alt="ai" />
</p>

---

## Overview

A comprehensive **Smart Office Energy Management System** with real-time monitoring, device control, predictive analytics, and multi-platform accessibility. Built for the Teckathon hackathon.

**Live Dashboard** — Real-time WebSocket-powered control panel with interactive floor plan, live charts, device management, and alert monitoring.

**Discord Bot** — Full-featured command interface for monitoring and controlling the office from any Discord channel.

**AI Engine** — Intelligent recommendations, efficiency scoring, anomaly detection, and predictive analytics.

**Simulation Engine** — Realistic office behavior modeling with morning/lunch/evening schedules, weekend mode, random employee mistakes, and power anomaly simulation.

---

## Screenshots

| Dashboard | Floor Plan | Charts |
|-----------|------------|--------|
| Live power monitoring, device toggles, stats | Interactive room visualization with animated devices | Power trends, room comparison, heatmap |

| Alerts Sidebar | Discord Bot | Mobile View |
|----------------|-------------|-------------|
| Real-time alert stream with severity colors | Rich embedded commands | Responsive design |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │Dashboard │  │ FloorPlan│  │ Charts (Chart.js)     │  │
│  │Controls  │  │   Viz    │  │ Trend/Room/Heatmap    │  │
│  └────┬─────┘  └──────────┘  └──────────────────────┘  │
│       │              Socket.IO Client                   │
└───────┼─────────────────────────────────────────────────┘
        │ WebSocket (real-time)
┌───────┼─────────────────────────────────────────────────┐
│  ┌────┴──────────────────────────────────────────────┐  │
│  │              Express Server (Node.js)              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │  Routes  │ │Socket.IO │ │  Alert Engine     │  │  │
│  │  │  /api/*  │ │ Broadcast│ │  After-hours/Long │  │  │
│  │  └────┬─────┘ └──────────┘ └──────────────────┘  │  │
│  │       │                                           │  │
│  │  ┌────┴──────────────────────────────────────┐   │  │
│  │  │            Services Layer                  │   │  │
│  │  │  Device  │  Usage   │  Alert  │ Simul.  │  │   │  │
│  │  │  Service │  Service │ Service │ Service │  │   │  │
│  │  └─────────┴──────────┴─────────┴─────────┘  │   │  │
│  └───────────────────────┬───────────────────────┘   │  │
│                          │                            │
│  ┌───────────────────────┴───────────────────────┐   │  │
│  │              SQLite Database                   │   │  │
│  │  devices │ logs │ usage_tracking │ alerts     │   │  │
│  └───────────────────────────────────────────────┘   │  │
└──────────────────────────────────────────────────────┘  │
                                                          │
┌───────────────────────┐    ┌──────────────────────────┐ │
│    Discord Bot        │◄──►│      AI Service          │ │
│  !status !room !usage │    │  Recommendations/Score   │ │
│  !alerts !history     │    │  Health Summary/Report   │ │
│  !devices !toproom    │    │  Anomaly Detection       │ │
│  !powergraph !help    │    └──────────────────────────┘ │
└───────────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Web UI / Discord / Simulation)
        │
        ▼
  ┌──────────┐
  │  API      │ POST /api/devices/:id/toggle
  │  Route    │ GET  /api/usage
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │ Service  │ DeviceService.toggle()
  │  Layer   │ UsageService.update()
  └────┬─────┘
       │
       ├──► Database (SQLite)
       │      ├── devices (state)
       │      ├── logs (audit trail)
       │      └── usage_tracking (history)
       │
       ├──► Alert Engine
       │      ├── checkAfterHours()
       │      ├── checkLongOn()
       │      └── checkPowerAnomalies()
       │
       └──► Socket.IO Broadcast
              ├── device_update
              ├── usage_update
              ├── alerts_update
              └── new_alert
```

### WebSocket Event Flow

```
Client Connects
       │
       ▼
Server emits initial state:
  ├── device_update  (all devices)
  ├── usage_update   (power, kWh, cost)
  └── alerts_update  (active alerts)

On Device Toggle:
  ├── POST /api/devices/:id/toggle
  ├── DB update + log entry
  ├── Alert check run
  └── Broadcast:
       ├── device_update (new state)
       └── usage_update  (recalculated)

On Alert Trigger:
  └── Broadcast:
       ├── new_alert     (single alert)
       └── alerts_update (full list)

Client can request_refresh anytime
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | SQLite (better-sqlite3) — WAL mode, foreign keys |
| **Frontend** | Vanilla JS, CSS with glass-morphism design |
| **Charts** | Chart.js (trend, room comparison, heatmap) |
| **Real-time** | Socket.IO (WebSocket with auto-reconnect) |
| **Bot** | discord.js v14 (prefix commands, rich embeds) |
| **AI** | OpenAI GPT (optional) with fallback rule engine |
| **Concurrency** | concurrently (dev mode) |

---

## Features

### Dashboard
- **Live Power Monitoring** — Real-time wattage, kWh tracking, cost estimation
- **Interactive Floor Plan** — Visual room layout with glowing lights and animated fans
- **Power Trend Graph** — 24-hour power consumption timeline
- **Room Comparison** — Bar chart comparing per-room consumption
- **Usage Heatmap** — Weekly energy usage visualization
- **Activity Timeline** — Recent device toggle activity
- **Device Management** — Search, filter by room/type/status, individual toggle switches
- **Alert Center** — Sidebar with severity-colored alerts (warning/critical)
- **Stats Cards** — Current power, today's consumption, monthly bill, active device count
- **Live Clock** — Real-time office hours indicator (Open/Closed/Weekend)
- **System Status** — Total load, grid status, last sync time
- **Theme Toggle** — Dark/Light mode
- **Mobile Responsive** — Adapts to all screen sizes
- **Glass-morphism UI** — Modern design with backdrop blur and ambient orbs

### Simulation Engine
- **Office Schedule** — Morning arrival, lunch break, afternoon work, evening shutdown
- **Weekend Mode** — Reduced activity on weekends
- **Random Mistakes** — Devices accidentally left on then turned off
- **Forgotten Devices** — Auto-turn-off after office hours
- **Runtime Tracking** — Per-device uptime and runtime tracking
- **Power Anomalies** — Detection of high power draw

### Discord Bot
- `!status` — All rooms with device counts and power
- `!room <name>` — Detailed room view
- `!usage` — Power consumption with cost projections
- `!alerts` — Active alert list
- `!history [N]` — Recent activity log
- `!devices` — Global device summary
- `!toproom` — Rank rooms by power usage
- `!powergraph` — ASCII power history graph
- `!help` — Command reference
- **Proactive Alerts** — Auto-pushes alerts to configured channel
- **Rich Embeds** — Colored embedded messages with timestamp

### AI Features
- **Energy Recommendations** — Contextual tips based on current state
- **Efficiency Score** — 0-100 rating based on utilization
- **Health Summary** — Natural language office status
- **Daily Report** — Comprehensive daily summary
- **Fallback Engine** — Rule-based recommendations when AI not configured

### Alert Engine
- **After-Hours Detection** — Devices on outside business hours
- **Long-On Detection** — Devices on for extended periods
- **Power Anomaly Detection** — Spikes in total consumption
- **Auto-Resolution** — Alerts resolve when condition clears
- **Severity Levels** — Warning vs critical classification
- **Persistent Storage** — Alerts stored in database (survive restart)

---

## Quick Start

```bash
# Clone
git clone https://github.com/tayyab011/Teckathon-round1.git
cd Teckathon-round1

# Install
npm install

# Configure
cp env.example .env
# Edit .env with your settings

# Run (server only)
npm start

# Run (server + Discord bot)
npm run dev
```

Open **http://localhost:5000** in your browser.

---

## Installation Guide

### Prerequisites
- Node.js 18+
- npm

### Step-by-Step

1. **Clone the repository**
   ```bash
   git clone https://github.com/tayyab011/Teckathon-round1.git
   cd Teckathon-round1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   Edit `.env`:
   ```env
   PORT=5000
   BACKEND_URL=http://localhost:5000
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ALERTS_CHANNEL_ID=your_alerts_channel_id
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the dashboard**
   Open `http://localhost:5000`

6. **(Optional) Run Discord bot**
   ```bash
   npm run bot
   ```
   or both together:
   ```bash
   npm run dev
   ```

---

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** settings:
   - Click **Reset Token** and copy it
   - Enable **Message Content Intent** under Privileged Gateway Intents
4. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Embed Links`
   - Copy generated URL and open in browser to invite bot
5. Add to `.env`:
   ```env
   DISCORD_BOT_TOKEN=your_token_here
   ALERTS_CHANNEL_ID=channel_id_for_alerts
   ```

---

## API Documentation

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/devices` | List all devices (supports `?room=`, `?type=`, `?status=` filters) |
| `GET` | `/api/devices/:id` | Get device by ID |
| `GET` | `/api/devices/room/:room` | Get devices by room |
| `POST` | `/api/devices/:id/toggle` | Toggle device ON/OFF |

**Response example** (`GET /api/devices`):
```json
[{
  "id": "light_1",
  "name": "Light 1",
  "room": "Drawing Room",
  "type": "light",
  "status": "on",
  "powerDrawWhenOn": 15,
  "currentPower": 15,
  "uptimeSeconds": 120,
  "runtimeSeconds": 300,
  "lastChanged": "2026-07-04T05:25:29.139Z"
}]
```

### Usage

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/usage` | Current power usage and cost data |
| `GET` | `/api/usage/history?days=7` | Historical usage data points |
| `GET` | `/api/usage/daily?days=30` | Daily aggregated totals |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | List alerts (`?resolved=true` for all) |
| `POST` | `/api/alerts/:id/resolve` | Resolve an alert |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs?limit=100` | Device activity logs (supports `?device_id=`, `?action=` filters) |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/recommendation` | Energy-saving recommendation |
| `GET` | `/api/ai/health-summary` | Office health summary |
| `GET` | `/api/ai/efficiency-score` | 0-100 efficiency score |
| `GET` | `/api/ai/daily-report` | Comprehensive daily report |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

---

## Database Schema

### `devices`
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | Device identifier (e.g., `light_1`, `fan_10`) |
| `name` | TEXT | Display name |
| `room` | TEXT | Room assignment |
| `type` | TEXT | `light` or `fan` |
| `status` | TEXT | `on` or `off` |
| `power_draw` | INTEGER | Power draw in watts |
| `uptime_seconds` | REAL | Total time since last off |
| `runtime_seconds` | REAL | Total time on |
| `last_changed` | TEXT | ISO timestamp of last change |

### `logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `device_id` | TEXT FK | References `devices(id)` |
| `action` | TEXT | `turned_on` / `turned_off` |
| `timestamp` | TEXT | ISO timestamp |

### `usage_tracking`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `total_kwh` | REAL | Cumulative kWh |
| `cost` | REAL | Cumulative cost |
| `recorded_at` | TEXT | ISO timestamp |

### `alerts`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `device_id` | TEXT | Related device (nullable) |
| `type` | TEXT | `after-hours`, `long-on`, `power-spike` |
| `message` | TEXT | Alert description |
| `severity` | TEXT | `warning` or `critical` |
| `resolved` | INTEGER | 0 = active, 1 = resolved |
| `created_at` | TEXT | ISO timestamp |
| `resolved_at` | TEXT | ISO timestamp (nullable) |

---

## Discord Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `!status` | Show all rooms with device counts and total power | `!status` |
| `!room <name>` | Show devices in a specific room | `!room drawing` |
| `!usage` | Show power consumption breakdown | `!usage` |
| `!alerts` | List all active alerts | `!alerts` |
| `!history [N]` | Show last N activity log entries | `!history 5` |
| `!devices` | Show summary of all devices | `!devices` |
| `!toproom` | Rank rooms by power usage | `!toproom` |
| `!powergraph` | Show ASCII power history graph | `!powergraph` |
| `!help` | Show all available commands | `!help` |

**Room aliases:** `drawing`, `drawing room`, `work1`, `work 1`, `work room 1`, `work2`, `work 2`, `work room 2`

---

## Hardware Documentation (Concept)

### Component List
- **ESP32/Arduino** — Microcontroller for I/O and network connectivity
- **ACS712 Current Sensor** — 5A/20A/30A variant for AC current measurement
- **Relay Module** — 4/8 channel for device switching
- **Power Supply** — 5V/2A for microcontroller + 12V for relays
- **LED Indicators** — Status LEDs per device channel

### Pin Mapping (ESP32)
| ESP32 Pin | Component | Function |
|-----------|-----------|----------|
| GPIO 32 | ACS712 VCC | Sensor power |
| GPIO 33 | ACS712 OUT | Current reading (analog) |
| GPIO 25 | Relay 1 | Light 1 control |
| GPIO 26 | Relay 2 | Light 2 control |
| GPIO 27 | Relay 3 | Light 3 control |
| GPIO 14 | Relay 4 | Fan 1 control |
| GPIO 12 | Relay 5 | Fan 2 control |
| GPIO 5 | Relay 6 | Spare |

### Wiring Diagram
```
ESP32 ──┬── ACS712 ── AC Load (monitoring)
        ├── Relay 1 ── Light 1
        ├── Relay 2 ── Light 2
        ├── Relay 3 ── Light 3
        ├── Relay 4 ── Fan 1
        └── Relay 5 ── Fan 2
```

### Current Sensing (ACS712)
- Hall-effect-based linear current sensor
- Measures AC/DC current up to 5A/20A/30A (selectable variant)
- Output: 185 mV/A (for 5A variant), 100 mV/A (for 20A variant)
- Connect IN pin to AC load line, OUT pin to ESP32 ADC
- Formula: `Current (A) = (Vout - Vcc/2) / Sensitivity`
- Power (W) = Current × Voltage (assuming 230V/120V AC)

### Scaling to Multiple Rooms
- 3 ESP32 units (one per room)
- Central server aggregates via MQTT or REST API
- Each unit manages 5 devices locally
- 3 × ACS712 sensors (one per room feed)
- Total: 3 ESP32 + 3 ACS712 + 15 relays + 15 devices

### Electrical Safety Notes
- Use optocouplers between ESP32 and relay modules
- Proper fuse rating on each AC branch
- Ground all ESP32 units to common ground
- Use appropriate wire gauge for load current
- Include emergency shutoff switch

---

## Project Structure

```
Teckathon-round1/
├── server.js                    # Entry point
├── discord-bot.js               # Discord bot (prefix commands + embeds)
├── package.json                 # Dependencies & scripts
├── env.example                  # Environment template
├── README.md                    # This file
├── public/
│   └── index.html               # Dashboard frontend
├── src/
│   ├── app.js                   # Express app setup
│   ├── config/
│   │   ├── index.js             # Configuration loader
│   │   └── constants.js         # App constants
│   ├── db/
│   │   └── index.js             # Database setup, schema, seed
│   ├── middleware/
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validation.js        # Request validation
│   ├── services/
│   │   ├── deviceService.js     # Device CRUD, toggle
│   │   ├── usageService.js      # Power/energy calculations
│   │   ├── alertService.js      # Alert engine
│   │   ├── simulationService.js # Office behavior simulation
│   │   └── aiService.js         # AI recommendations & scoring
│   ├── controllers/
│   │   ├── deviceController.js
│   │   ├── usageController.js
│   │   ├── alertController.js
│   │   └── logController.js
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── devices.js
│   │   ├── usage.js
│   │   ├── alerts.js
│   │   ├── logs.js
│   │   └── ai.js
│   ├── websocket/
│   │   └── index.js             # Socket.IO setup
│   └── utils/
│       └── index.js             # Utility functions
└── tests/
    ├── api.test.js              # Integration tests
    ├── power.test.js            # Unit tests (power/calc)
    └── run.js                   # Test runner
```

---

## Deployment Guide

### Production Deployment

```bash
# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name office-monitor

# Start bot (optional)
pm2 start discord-bot.js --name office-bot

# Save PM2 process list
pm2 save

# Set up startup on boot
pm2 startup
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t office-monitor .
docker run -d -p 5000:5000 --env-file .env office-monitor
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP server port |
| `BACKEND_URL` | `http://localhost:5000` | Backend URL for bot |
| `DISCORD_BOT_TOKEN` | — | Discord bot token |
| `ALERTS_CHANNEL_ID` | — | Discord channel for alerts |
| `SIMULATION_ENABLED` | `true` | Enable simulation engine |
| `BUSINESS_HOUR_START` | `9` | Office open hour |
| `BUSINESS_HOUR_END` | `17` | Office close hour |
| `ALERT_INTERVAL_MS` | `5000` | Alert check interval |
| `USAGE_INTERVAL_MS` | `10000` | Usage tracking interval |
| `SIMULATION_INTERVAL_MS` | `30000` | Simulation cycle interval |
| `LONG_ON_THRESHOLD_HOURS` | `2` | Long-on alert threshold |
| `COST_PER_KWH` | `0.12` | Energy cost per kWh |
| `OPENAI_API_KEY` | — | OpenAI API key (AI features) |
| `AI_MODEL` | `gpt-4o-mini` | AI model to use |

---

## Testing

```bash
# Run all tests
npm test

# Run API integration tests
node tests/api.test.js

# Run power calculation unit tests
node tests/power.test.js
```

### Test Coverage
- **API Tests**: Health, device CRUD, room filtering, toggle, usage, alerts, logs, error handling
- **Power Tests**: Config validation, power calculations, kWh conversion, cost estimation, toggle logic, threshold detection

### Manual QA Checklist
- [ ] Dashboard loads without errors
- [ ] WebSocket connects and receives live updates
- [ ] Device toggles work from dashboard and API
- [ ] Floor plan reflects device states
- [ ] Charts update with live data
- [ ] Alerts appear/disappear correctly
- [ ] Discord bot responds to all commands
- [ ] Theme toggle works
- [ ] Search and filters work on devices
- [ ] Mobile layout is usable
- [ ] Server starts clean without database
- [ ] No console errors in browser

---

## Hardcoded Configuration

The current implementation uses these values that should be customized:

| Parameter | Value | Location |
|-----------|-------|----------|
| Business hours | 9:00 - 17:00 | `src/config/index.js` |
| Light power draw | 15W | `src/config/constants.js` |
| Fan power draw | 60W | `src/config/constants.js` |
| Devices per room | 3 lights + 2 fans | `src/config/constants.js` |
| Long-on threshold | 2 hours | `src/config/index.js` |
| Energy cost | $0.12/kWh | `src/config/index.js` |
| Data retention | 30 days | `src/config/constants.js` |

---

## Future Improvements

- **User Authentication** — Login system with role-based access
- **Multi-Office Support** — Switch between different office locations
- **Advanced Analytics** — ML-based usage prediction and anomaly detection
- **Export/Reporting** — CSV/PDF report generation
- **Scheduled Automation** — Set rules like "turn off all lights at 6 PM"
- **Integration APIs** — Webhook support, IFTTT integration
- **Mobile App** — Native iOS/Android application
- **Battery Backup Monitoring** — UPS status and battery health
- **HVAC Integration** — Temperature and AC control
- **Solar Integration** — Solar panel production monitoring
- **Energy Storage** — Battery storage system management
- **Demand Response** — Automatic load shedding during peak pricing

---

## Troubleshooting

### Server won't start
```
Error: Module not found
```
Run `npm install` to install dependencies.

### Port in use
```
Error: listen EADDRINUSE :::5000
```
Change `PORT` in `.env` or kill existing process:
```bash
lsof -i :5000
kill -9 <PID>
```

### Discord bot not responding
- Verify `DISCORD_BOT_TOKEN` is correct in `.env`
- Ensure **Message Content Intent** is enabled in Discord Developer Portal
- Check bot has proper permissions (Send Messages, Read Message History, Embed Links)
- Re-invite bot with correct OAuth2 scopes

### Dashboard shows no data
- Ensure server is running
- Check browser console for WebSocket connection errors
- Verify no firewall blocking port 5000
- Try accessing `/api/health` directly

### Alerts not appearing
- Alerts trigger only when devices are ON during after-hours or for extended periods
- Check `ALERT_INTERVAL_MS` in configuration
- Ensure system clock is correct

---

## Demo Guide

### 3-Minute Scripted Demo

1. **Start** (0:00-0:30)
   - Open dashboard, show live status with 0W consumption
   - Point out stats cards (power, kWh, cost, device count)
   - Show office hours indicator (Open/Closed)

2. **Device Control** (0:30-1:00)
   - Toggle devices via dashboard switches
   - Show real-time WebSocket updates
   - Demonstrate search and filter functionality

3. **Floor Plan** (1:00-1:30)
   - Show animated room visualization
   - Toggle lights — show glowing effect
   - Toggle fans — show spinning animation

4. **Charts & Analytics** (1:30-2:00)
   - Show power trend graph updating
   - Room comparison chart
   - Weekly heatmap

5. **Discord Bot** (2:00-2:30)
   - Run `!status`, `!usage`, `!alerts`, `!toproom`
   - Show rich embed formatting
   - Demonstrate proactive alert push

6. **Alerts & AI** (2:30-3:00)
   - Show alert creation and sidebar
   - AI recommendation and efficiency score
   - Daily report generation

---

## License

This project is submitted for Teckathon hackathon. All rights reserved.

---

<p align="center">
  Built with ⚡ for Teckathon Round 1
</p>
