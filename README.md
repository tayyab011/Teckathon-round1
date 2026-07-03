# Office Device Simulator — Teckathon Round 1

Real-time office device monitoring dashboard with Discord bot integration.

---

## Features

- **Live Dashboard** — Glass-morphism UI with WebSocket updates, floor plan, and device toggles
- **Discord Bot** — Query status, room details, and power usage via `!commands`
- **Alert Engine** — Detects after-hours usage and devices left ON too long
- **SQLite Persistence** — Device state, usage history, and audit logs

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Start server + bot together
npm run dev
```

Open http://localhost:5000

---

## Discord Bot

| Command | Description |
|---------|-------------|
| `!status` | Show all rooms and power usage |
| `!room <name>` | Show devices in a room |
| `!usage` | Show consumption breakdown |

Room aliases: `drawing`, `work1`, `work2`

To use the bot:
1. Create an app at https://discord.com/developers/applications
2. Enable **Message Content Intent** under Bot settings
3. Copy token to `.env`: `DISCORD_BOT_TOKEN=your_token`
4. Generate invite URL under OAuth2 → URL Generator (scopes: `bot`, permissions: `Send Messages` + `Read Message History`)

---

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/devices` | All devices with status & power |
| `GET /api/devices/room/:room` | Devices by room |
| `POST /api/devices/:id/toggle` | Toggle device ON/OFF |
| `GET /api/usage` | Power consumption & kWh estimate |
| `GET /api/alerts` | Unresolved alerts |
| `GET /api/logs?limit=100` | Toggle history |

---

## Project Structure

```
server.js           Express + Socket.IO + SQLite backend
discord-bot.js      Discord bot
package.json        Dependencies
env.example         Environment template
public/index.html   Dashboard UI
```

---

## Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Database:** SQLite (better-sqlite3)
- **Frontend:** Vanilla JS, CSS glass-morphism
- **Bot:** discord.js v14
- **Process:** concurrently
