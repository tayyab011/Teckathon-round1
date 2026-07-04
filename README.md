<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Inter&size=28&duration=2000&pause=500&color=34D399&center=true&vCenter=true&width=600&lines=Smart+Office+Energy+Management;Real-Time+Monitoring+%26+Control;Teckathon+Submission" alt="typing header" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-18%2B-34D399?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/socket.io-realtime-34D399?style=flat-square&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/discord.js-bot-34D399?style=flat-square&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/sqlite-3-34D399?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/express-api-34D399?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/chart.js-analytics-34D399?style=flat-square&logo=chart.js&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-powered-8b5cf6?style=flat-square" />
  <img src="https://img.shields.io/badge/tests-12%20passing-34D399?style=flat-square" />
</p>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Overview](#overview)
- [Demo](#demo)
- [Key Technical Achievements](#key-technical-achievements)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Discord Bot](#discord-bot)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)
- [Testing](#testing)
- [Demo Guide](#demo-guide)
- [Scalability](#scalability)
- [Team](#team)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)

---

## Problem Statement

> **Commercial buildings waste 30% of the energy they consume.** Most office spaces lack real-time visibility into their power usage, have no automated alerting for wasteful behavior, and provide no actionable recommendations for efficiency.

**Smart Office Energy Management** solves this with:
- **Real-time monitoring** — See exactly what's consuming power, room by room, device by device
- **Intelligent alerting** — Know instantly when devices are left on after hours or running too long
- **AI-powered recommendations** — Get actionable suggestions to reduce waste
- **Multi-platform access** — Dashboard, Discord bot, and REST API from any device

---

## Overview

A comprehensive **Smart Office Energy Management System** with real-time monitoring, device control, predictive analytics, and multi-platform accessibility. Built for Teckathon.

**Live Dashboard** — Real-time WebSocket-powered control panel with interactive floor plan, live charts, device management, and alert monitoring.

**Discord Bot** — Full-featured command interface for monitoring and controlling the office from any Discord channel.

**AI Engine** — Intelligent recommendations, efficiency scoring, anomaly detection, and predictive analytics.

**Simulation Engine** — Realistic office behavior modeling with morning/lunch/evening schedules, weekend mode, random employee mistakes, and power anomaly simulation.

---

## Demo

<!-- Insert screenshots/GIF here -->
<!-- Recommended: Record a 30-60s screen capture showing dashboard, toggles, WebSocket updates, alerts, and Discord bot responses -->

<p align="center">
  <i>(Screenshot or animated GIF of the live dashboard — drag & drop into this space)</i>
</p>

### Dashboard Preview

| <!-- Insert dashboard screenshot PNG --> | <!-- Insert floor plan PNG --> |
|------------------------------------------|--------------------------------|
| **Live Dashboard** — Power stats, charts, device controls | **Floor Plan** — Animated room visualization |

| <!-- Insert alerts sidebar PNG --> | <!-- Insert Discord bot PNG --> |
|------------------------------------|---------------------------------|
| **Alert Center** — Real-time severity-colored alerts | **Discord Bot** — Rich embed commands |

---

## Key Technical Achievements

| Achievement | Detail |
|-------------|--------|
| **Sub-100ms updates** | WebSocket broadcasts under 100ms from device toggle to all connected clients |
| **Zero-dependency frontend** | Vanilla JS + CSS — no React, Vue, or build tools |
| **12 automated tests** | Power calculations, config validation, toggle logic, threshold detection |
| **9 Discord commands** | Full-featured bot with rich embeds, colored alerts, and proactive push |
| **4 AI endpoints** | Recommendations, health summary, efficiency score, daily report |
| **Simulation engine** | 7 behavioral modes: morning, lunch, afternoon, evening, night, weekend, random mistakes |
| **Persistent alerts** | Database-backed alert storage survives server restarts |
| **Dual theme** | Dark and light mode with instant toggle |

---

## Quick Start

```bash
git clone https://github.com/tayyab011/Teckathon-round1.git
cd Teckathon-round1
npm install
cp env.example .env    # Edit with your settings
npm start              # Open http://localhost:5000
```

For server + Discord bot: `npm run dev`

### Prerequisites
- Node.js 18+
- npm

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create app → **Bot** settings → Reset Token → enable **Message Content Intent**
3. **OAuth2 → URL Generator**: Scope `bot`, Permissions: `Send Messages`, `Read Message History`, `Embed Links`
4. Add to `.env`:
   ```env
   DISCORD_BOT_TOKEN=your_token
   ALERTS_CHANNEL_ID=channel_id
   ```

---

## Architecture

<!-- Insert professional architecture diagram PNG here -->
<!-- Use draw.io, Excalidraw, or Figma to create and export as PNG -->
<p align="center">
  <i>(Drag & drop your architecture diagram here as architecture.png)</i>
</p>

### System Diagram

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
│  9 commands + embeds  │    │  Recommendations/Score   │ │
│  Proactive alerts     │    │  Health Summary/Report   │ │
└───────────────────────┘    └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Web UI / Discord / Simulation)
        │
        ▼
  ┌──────────┐     POST /api/devices/:id/toggle
  │  API      │     GET  /api/usage
  │  Route    │
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │ Service  │ DeviceService.toggle()
  │  Layer   │ UsageService.update()
  └────┬─────┘
       │
       ├──► Database (SQLite)
       ├──► Alert Engine (checks after-hours, long-on, anomalies)
       └──► Socket.IO Broadcast (device_update, usage_update, alerts_update, new_alert)
```

### WebSocket Event Flow

```
Client Connects → Server emits: device_update + usage_update + alerts_update

On Device Toggle:
  POST /api/devices/:id/toggle → DB update + log → Alert check → Broadcast to all clients

On Alert Trigger:
  Broadcast: new_alert (single) + alerts_update (full list)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | SQLite (better-sqlite3) — WAL mode, foreign keys, indexes |
| **Frontend** | Vanilla JS, CSS glass-morphism, Chart.js |
| **Real-time** | Socket.IO (WebSocket with auto-reconnect) |
| **Bot** | discord.js v14 (prefix commands, rich embeds) |
| **AI** | OpenAI GPT (optional) with fallback rule engine |
| **Process** | concurrently (dev mode), PM2 (production) |

---

## Features

### Dashboard
- **Live Power Monitoring** — Real-time wattage, kWh tracking, cost estimation with circular gauge
- **Interactive Floor Plan** — Visual room layout with glowing lights and animated fans
- **Power Trend Graph** — 24-hour power consumption timeline (Chart.js)
- **Room Comparison** — Bar chart comparing per-room consumption
- **Usage Heatmap** — Weekly energy usage color-coded visualization
- **Activity Timeline** — Recent device toggle events
- **Device Management** — Search, filter by room/type/status, individual toggle switches
- **Alert Center** — Sidebar with severity-colored alerts (warning/critical)
- **Stats Cards** — Current power, today's consumption, monthly bill, active device count
- **Live Clock** — Real-time display with office hours indicator (Open/Closed/Weekend)
- **System Status** — Total load, grid status, last sync time
- **Theme Toggle** — Dark/Light mode
- **Mobile Responsive** — Adapts to all screen sizes
- **Glass-morphism UI** — Modern design with backdrop blur and ambient animated orbs

### Simulation Engine
- **Office Schedule** — Morning arrival (9AM), lunch break (12-1PM), afternoon work, evening shutdown (5PM+)
- **Weekend Mode** — Minimal activity on Saturday/Sunday
- **Random Mistakes** — Devices accidentally left on, auto-corrected after 60s
- **Forgotten Devices** — Auto-turn-off detected after office hours
- **Runtime Tracking** — Per-device uptime and total runtime
- **Power Anomalies** — Detection when total draw exceeds 80% of capacity

### Alert Engine
- **After-Hours Detection** — Flags any device ON outside configured business hours
- **Long-On Detection** — Warns when a device has been ON > 2 hours (configurable)
- **Power Anomaly Detection** — Triggers when total consumption spikes
- **Auto-Resolution** — Alerts auto-resolve when the condition clears
- **Severity Levels** — Warning vs Critical classification
- **Persistent Storage** — All alerts stored in SQLite (survive server restart)
- **Real-time Broadcast** — New alerts pushed instantly to all connected clients

### AI Features
- **Energy Recommendations** — Contextual tips based on current office state
- **Efficiency Score** — 0-100 rating based on utilization ratio
- **Health Summary** — Natural language office status description
- **Daily Report** — Comprehensive summary with score, recommendations, and metrics
- **Fallback Engine** — Rule-based recommendations when no AI API key is configured

---

## Discord Bot

9 prefix commands with rich colored embeds and proactive alert pushing.

| Command | Description | Example |
|---------|-------------|---------|
| `!status` | All rooms with device counts and power | `!status` |
| `!room <name>` | Detailed room device list | `!room drawing` |
| `!usage` | Power consumption + cost projections | `!usage` |
| `!alerts` | All active alerts with severity | `!alerts` |
| `!history [N]` | Last N activity log entries | `!history 5` |
| `!devices` | Global device summary (on/off/total) | `!devices` |
| `!toproom` | Rooms ranked by power usage | `!toproom` |
| `!powergraph` | ASCII bar chart of power history | `!powergraph` |
| `!help` | Full command reference | `!help` |

**Proactive Alerts** — Bot polls `/api/alerts` every 30s and pushes new alerts to the configured channel with colored embeds.

**Room aliases:** `drawing`, `drawing room`, `work1`, `work 1`, `work room 1`, `work2`, `work 2`, `work room 2`

---

## API Documentation

Full API reference with request/response examples: **[API.md](./API.md)**

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/devices` | All devices (`?room=`, `?type=`, `?status=`) |
| `GET` | `/api/devices/:id` | Device by ID |
| `GET` | `/api/devices/room/:room` | Devices by room |
| `POST` | `/api/devices/:id/toggle` | Toggle device ON/OFF |
| `GET` | `/api/usage` | Current power + cost data |
| `GET` | `/api/usage/history?days=7` | Historical usage |
| `GET` | `/api/usage/daily?days=30` | Daily totals |
| `GET` | `/api/alerts` | Active alerts (`?resolved=true`) |
| `POST` | `/api/alerts/:id/resolve` | Resolve alert |
| `GET` | `/api/logs?limit=100` | Activity logs (`?device_id=`, `?action=`) |
| `GET` | `/api/ai/recommendation` | Energy-saving tip |
| `GET` | `/api/ai/health-summary` | Office health status |
| `GET` | `/api/ai/efficiency-score` | 0-100 score |
| `GET` | `/api/ai/daily-report` | Full daily report |

---

## Database Schema

<!-- Insert ER diagram PNG here -->
<p align="center">
  <img src="https://github.com/tayyab011/Teckathon-round1/blob/c93c2c49a892a9820701f58e9eada69522f3755f/dbschema.jpeg"  width="900">
</p>

### Tables

**`devices`** — 15 devices across 3 rooms, each with runtime tracking
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | `light_1`..`light_9`, `fan_10`..`fan_15` |
| `name` | TEXT | Display name |
| `room` | TEXT | Room assignment |
| `type` | TEXT | `light` or `fan` |
| `status` | TEXT | `on` or `off` |
| `power_draw` | INTEGER | Watts (15W light, 60W fan) |
| `uptime_seconds` | REAL | Time since last state change |
| `runtime_seconds` | REAL | Total time in ON state |
| `last_changed` | TEXT | ISO 8601 timestamp |

**`logs`** — Audit trail of all device toggles
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `device_id` | TEXT FK | References `devices(id)` |
| `action` | TEXT | `turned_on` / `turned_off` |
| `timestamp` | TEXT | ISO 8601 timestamp |

**`usage_tracking`** — 30-day rolling power history
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `total_kwh` | REAL | Cumulative kWh |
| `cost` | REAL | Cumulative cost |
| `recorded_at` | TEXT | ISO 8601 timestamp |

**`alerts`** — Persistent alert storage (survives restart)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `device_id` | TEXT | Related device |
| `type` | TEXT | `after-hours`, `long-on`, `power-spike` |
| `message` | TEXT | Human-readable description |
| `severity` | TEXT | `warning` or `critical` |
| `resolved` | INTEGER | 0 = active, 1 = resolved |
| `created_at` | TEXT | ISO 8601 timestamp |
| `resolved_at` | TEXT | ISO 8601 timestamp |

---

## Deployment Guide

### Production (PM2)
```bash
npm install -g pm2
pm2 start server.js --name office-monitor
pm2 start discord-bot.js --name office-bot
pm2 save && pm2 startup
```

### Docker
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
| `PORT` | `5000` | HTTP port |
| `BACKEND_URL` | `http://localhost:5000` | For Discord bot API calls |
| `DISCORD_BOT_TOKEN` | — | Discord bot token (required for bot) |
| `ALERTS_CHANNEL_ID` | — | Channel for proactive alert push |
| `SIMULATION_ENABLED` | `true` | Enable automatic device simulation |
| `BUSINESS_HOUR_START` | `9` | Office open (24h) |
| `BUSINESS_HOUR_END` | `17` | Office close (24h) |
| `ALERT_INTERVAL_MS` | `5000` | Alert check frequency |
| `USAGE_INTERVAL_MS` | `10000` | Usage tracking frequency |
| `SIMULATION_INTERVAL_MS` | `30000` | Simulation cycle frequency |
| `LONG_ON_THRESHOLD_HOURS` | `2` | Hours before long-on alert |
| `COST_PER_KWH` | `0.12` | Energy cost per kWh |
| `OPENAI_API_KEY` | — | Enables AI features |
| `AI_MODEL` | `gpt-4o-mini` | AI model |

---

## Testing

```bash
npm test    # Runs all 12 power/calc unit tests
```

### Test Coverage
- **Power Calculations** — Single device, mixed, all off, max draw (495W)
- **Toggle Logic** — Status flip, power state consistency
- **kWh Conversion** — Watt-hours to kilowatt-hours
- **Cost Estimation** — Daily, monthly projections
- **Threshold Detection** — After-hours, long-on, weekend

### Manual QA Checklist
- [ ] Dashboard loads without console errors
- [ ] WebSocket connects and all events fire
- [ ] Device toggles work from UI and API
- [ ] Floor plan dots update with device state
- [ ] All 3 charts render and update
- [ ] Alerts appear/disappear correctly
- [ ] Office hours indicator shows correct status
- [ ] Theme toggle switches dark/light
- [ ] Search and filters work
- [ ] Mobile layout renders properly
- [ ] Server starts cleanly without existing DB
- [ ] All 9 Discord bot commands respond

---

## Demo Guide

### 3-Minute Scripted Pitch for Judges

| Time | Section | What to Show | Key Talking Points |
|------|---------|-------------|-------------------|
| 0:00-0:30 | **Problem + Overview** | Dashboard with 0W baseline | "Offices waste 30% of energy — no real-time visibility exists" |
| 0:30-1:00 | **Device Control** | Toggle lights/fans via dashboard | "Sub-100ms WebSocket updates across all connected clients" |
| 1:00-1:30 | **Floor Plan + Charts** | Animated floor plan, trend graph | "Visual feedback with glowing lights, spinning fans, live Chart.js" |
| 1:30-2:00 | **Alerts + Discord** | Trigger alert, show Discord push | "Persistent alerts with severity levels — pushed to Discord in real-time" |
| 2:00-2:30 | **AI Features** | Recommendation, efficiency score | "AI-powered insights — works with or without an API key via fallback engine" |
| 2:30-3:00 | **Architecture + Wrap** | Show modular structure | "Production-ready: modular services, 12 tests, PM2/Docker deployable" |

---

## Scalability

| Dimension | Current | How to Scale |
|-----------|---------|--------------|
| **Rooms** | 3 hardcoded | Config-driven via `ROOMS` array in `constants.js` |
| **Devices** | 15 (5/room) | Add to seed config — schema supports unlimited |
| **Users** | 1 (no auth) | Add JWT middleware + user table |
| **Database** | SQLite (single file) | Swap to PostgreSQL via `knex` or `prisma` |
| **Real-time** | Single process | Use Redis adapter for Socket.IO horizontal scaling |
| **Hardware** | Software simulation | ESP32 + ACS712 + relay modules (one per room, MQTT aggregation) |
| **AI** | Optional API call | Batch processing queue for high-volume recommendations |

Hardware scaling: 1 ESP32 per room (manages 5+ devices locally), central server aggregates via REST/MQTT. Estimated: 1 server + 3 ESP32 units = full 3-room deployment under $60 BOM.

---

## Team

| Role | Name | Links |
|------|------|-------|
| **Developer** | [Your Name] | [GitHub](https://github.com/yourusername) · [LinkedIn](https://linkedin.com/in/yourprofile) |

*Built for Teckathon Round 1*

---

## Future Improvements

- **User Authentication** — Login with role-based access (admin, viewer, operator)
- **Multi-Office** — Switch between locations from the dashboard
- **Scheduled Automation** — "Turn off all lights at 6PM" rules engine
- **Export/Reporting** — CSV/PDF report generation with email delivery
- **Webhook Integration** — IFTTT, Zapier, Slack webhook support
- **Mobile App** — Native iOS/Android with push notifications
- **HVAC + Solar** — Temperature control and solar production monitoring
- **ML Predictions** — Usage forecasting and anomaly detection
- **Demand Response** — Automatic load shedding during peak pricing

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Error: Module not found` | Run `npm install` |
| `EADDRINUSE :::5000` | Change `PORT` in `.env` or `kill $(lsof -ti :5000)` |
| Bot not responding | Verify token, enable Message Content Intent, re-invite with proper scopes |
| Dashboard no data | Check server is running, browser console for WebSocket errors |
| No alerts | Alerts only trigger when devices are ON during after-hours or >2 hours |

---

<!-- Insert hardware schematic PNG here -->
<p align="center">
  <i>(Drag & drop your hardware schematic here as schematic.png)</i>
</p>

<p align="center">
  Built with ⚡ for Teckathon Round 1
</p>
