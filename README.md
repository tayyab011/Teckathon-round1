# Office Device Simulator

A real-time office device monitoring system for the Teckathon Round 1 hackathon. Simulates 15 devices (lights and fans) across 3 rooms, streams live state changes via WebSocket, and exposes REST APIs consumed by a web dashboard and Discord bot.

## Architecture

```
Simulated Devices → Backend (Express + Socket.IO) → Web Dashboard (real-time)
                                                 → Discord Bot (REST API)
```

- **Simulation**: 15 devices toggle randomly every 5-10 seconds with realistic wattages
- **Single source of truth**: Backend API + WebSocket push
- **Proactive alerts**: After-hours device ON detection, long-ON (>2h) detection

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Dashboard**: Vanilla HTML + JS, Socket.IO client
- **Discord Bot**: discord.js v14
- **Database**: In-memory (no external DB needed)

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone and install
cd Teckathon-round1
npm install
```

### Environment Variables

Copy `env.example` to `.env` and fill in:

```env
PORT=5000
BACKEND_URL=http://localhost:5000
DISCORD_BOT_TOKEN=your_token_here
ALERTS_CHANNEL_ID=your_channel_id_here
```

Only `DISCORD_BOT_TOKEN` is required for the bot. The server runs without any env vars.

## Run

### Start the backend server + dashboard

```bash
npm start
```

The dashboard is available at `http://localhost:5000`. The server simulates devices, serves the dashboard, and exposes APIs.

### Start the Discord bot (in a separate terminal)

```bash
npm run bot
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all devices with current state |
| GET | `/api/devices/room/:room` | Devices filtered by room name |
| GET | `/api/usage` | Total power + per-room breakdown + kWh estimate |
| GET | `/api/alerts` | Active unresolved alerts |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `device_update` | Server → Client | Full device array |
| `usage_update` | Server → Client | Usage + kWh data |
| `alerts_update` | Server → Client | Active alerts array |
| `new_alert` | Server → Client | Single new alert object |

## Discord Bot Commands

| Command | Description |
|---------|-------------|
| `!status` | Summary of all rooms (lights ON, fans ON, power) |
| `!room <name>` | Detailed status for a specific room |
| `!usage` | Current power draw + estimated daily/monthly kWh |

**Room synonyms**: `drawing`, `drawing room`, `work1`, `work 1`, `work room 1`, `work2`, `work 2`, `work room 2`

## Simulation Details

- **3 rooms**: Drawing Room, Work Room 1, Work Room 2
- **5 devices per room**: 3 lights (15W each) + 2 fans (60W each)
- **Total**: 15 devices
- **Toggle rate**: Every 5-10 seconds, 1-3 devices change state randomly
- **Energy tracking**: Cumulative kWh estimated from wattage × time between state changes

## Alert Conditions

1. **After-hours**: Devices left ON after 5 PM or before 9 AM
2. **Long-ON**: Any device ON for more than 2 continuous hours

Alerts auto-resolve when conditions clear.

## Folder Structure

```
Teckathon-round1/
├── server.js          # Backend server (API + WebSocket + simulation + alerts)
├── discord-bot.js     # Discord bot with !status, !room, !usage
├── public/
│   └── index.html     # Web dashboard
├── diagram.svg        # System architecture diagram
├── schematic.svg      # Hardware schematic (ESP32 + relays + sensors)
├── env.example        # Environment variable template
├── package.json
└── README.md
```

## Credits

Built for Teckathon Round 1.
