# API Documentation

## Base URL

```
http://localhost:5000/api
```

---

## Devices

### List All Devices

```
GET /api/devices
```

**Query Parameters:** `?room=`, `?type=light|fan`, `?status=on|off`

**Response:**
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

### Get Device by ID

```
GET /api/devices/:id
```

**Response:** Single device object (same format as above).

### Get Devices by Room

```
GET /api/devices/room/:room
```

Room names use hyphens/underscores as spaces. Example: `Drawing_Room`, `Work-Room-1`.

**Response:** Array of devices filtered by room.

### Toggle Device

```
POST /api/devices/:id/toggle
```

**Response:** Updated device object with new status.

---

## Usage

### Current Usage

```
GET /api/usage
```

**Response:**
```json
{
  "totalPowerWatts": 75,
  "totalPowerKw": 0.07,
  "estimatedKwhToday": 0.042,
  "estimatedCostToday": 0.01,
  "estimatedMonthlyCost": 0.30,
  "rooms": {
    "Drawing Room": {
      "totalPower": 15,
      "lightsOn": 1,
      "fansOn": 0,
      "deviceCount": 5,
      "activeDevices": 1
    },
    "Work Room 1": {
      "totalPower": 60,
      "lightsOn": 0,
      "fansOn": 1,
      "deviceCount": 5,
      "activeDevices": 1
    }
  },
  "timestamp": "2026-07-04T05:34:51.896Z"
}
```

### Usage History

```
GET /api/usage/history?days=7
```

**Response:** Array of historical data points within the specified number of days (max 90).

### Daily Totals

```
GET /api/usage/daily?days=30
```

**Response:** Daily aggregated totals (max 365 days).

---

## Alerts

### List Alerts

```
GET /api/alerts?resolved=true
```

By default returns only active (unresolved) alerts. Add `?resolved=true` to get all.

**Response:**
```json
[{
  "id": 1,
  "device_id": "light_1",
  "type": "after-hours",
  "message": "Light 1 (Drawing Room) is ON after office hours!",
  "severity": "warning",
  "resolved": 0,
  "created_at": "2026-07-04T18:30:00.000Z",
  "resolved_at": null
}]
```

### Resolve Alert

```
POST /api/alerts/:id/resolve
```

**Response:** `{ "success": true }`

---

## Logs

### Get Activity Logs

```
GET /api/logs?limit=100&device_id=light_1&action=turned_on
```

**Query Parameters:**
- `limit` — Number of entries (max 500, default 100)
- `device_id` — Filter by device
- `action` — Filter by action (`turned_on` / `turned_off`)

**Response:**
```json
[{
  "id": 1,
  "device_id": "light_1",
  "action": "turned_on",
  "timestamp": "2026-07-04T05:25:29.139Z"
}]
```

---

## AI

### Energy Recommendation

```
GET /api/ai/recommendation
```

**Response:** `{ "recommendation": "✅ Office running efficiently at 75W." }`

### Office Health Summary

```
GET /api/ai/health-summary
```

**Response:** `{ "summary": "Office running efficiently at 75W (0 kWh today)." }`

### Efficiency Score

```
GET /api/ai/efficiency-score
```

**Response:** `{ "score": 47 }` (0-100 scale)

### Daily Report

```
GET /api/ai/daily-report
```

**Response:**
```json
{
  "summary": "Office is idle. All devices are off.",
  "score": 25,
  "recommendations": "✅ Office running efficiently at 0W.",
  "data": {
    "totalPower": 0,
    "kwhToday": 0,
    "costToday": 0,
    "monthlyProjection": 0,
    "activeAlerts": 0,
    "activeDevices": 0
  },
  "timestamp": "2026-07-04T05:34:51.896Z"
}
```

---

## Health

```
GET /api/health
```

**Response:** `{ "status": "ok", "uptime": 120.5 }`

---

## Error Responses

All endpoints return errors in the format:

```json
{
  "error": "Description of what went wrong"
}
```

**HTTP Status Codes:**
- `400` — Bad request (invalid parameters)
- `404` — Resource not found
- `500` — Internal server error
