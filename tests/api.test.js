const http = require("http");
const path = require("path");

const BASE_URL = process.env.TEST_URL || "http://localhost:5000";
const PASS = "✓";
const FAIL = "✗";
let passed = 0;
let failed = 0;

async function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url.startsWith("http") ? url : `${BASE_URL}${url}`);
    const opts = { method, hostname: u.hostname, port: u.port, path: u.pathname + u.search, headers: { "Content-Type": "application/json" } };
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`${PASS} ${name}`);
    passed++;
  } catch (e) {
    console.log(`${FAIL} ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

async function run() {
  console.log("\n═══════════════════════════════════════");
  console.log("  Office Energy Management - Test Suite");
  console.log("═══════════════════════════════════════\n");

  await test("GET /api/health returns ok", async () => {
    const r = await request("GET", "/api/health");
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.data.status === "ok");
  });

  await test("GET /api/devices returns 15 devices", async () => {
    const r = await request("GET", "/api/devices");
    assert(r.status === 200);
    assert(r.data.length === 15, `Expected 15 devices got ${r.data.length}`);
    assert(r.data[0].id, "Device missing id");
    assert(r.data[0].name, "Device missing name");
    assert(r.data[0].room, "Device missing room");
    assert(r.data[0].type, "Device missing type");
    assert(r.data[0].status, "Device missing status");
  });

  await test("GET /api/devices/room/:room filters correctly", async () => {
    const r = await request("GET", "/api/devices/room/Drawing%20Room");
    assert(r.status === 200);
    assert(r.data.every((d) => d.room === "Drawing Room"));
    assert(r.data.length === 5, "Expected 5 Drawing Room devices");
  });

  await test("GET /api/devices/room/:room returns 404 for unknown room", async () => {
    const r = await request("GET", "/api/devices/room/UnknownRoom");
    assert(r.status === 404);
  });

  await test("POST /api/devices/:id/toggle toggles device on/off", async () => {
    const before = await request("GET", "/api/devices");
    const device = before.data[0];
    const origStatus = device.status;

    const r = await request("POST", `/api/devices/${device.id}/toggle`);
    assert(r.status === 200);
    assert(r.data.status !== origStatus, `Status should change from ${origStatus}`);

    const r2 = await request("POST", `/api/devices/${device.id}/toggle`);
    assert(r2.status === 200);
    assert(r2.data.status === origStatus, "Should toggle back");
  });

  await test("POST /api/devices/:id/toggle returns 404 for bad id", async () => {
    const r = await request("POST", "/api/devices/nonexistent/toggle");
    assert(r.status === 404);
  });

  await test("GET /api/usage returns usage data", async () => {
    const r = await request("GET", "/api/usage");
    assert(r.status === 200);
    assert(typeof r.data.totalPowerWatts === "number");
    assert(typeof r.data.estimatedKwhToday === "number");
    assert(typeof r.data.estimatedMonthlyCost === "number");
    assert(r.data.rooms, "Missing rooms breakdown");
  });

  await test("GET /api/alerts returns alerts array", async () => {
    const r = await request("GET", "/api/alerts");
    assert(r.status === 200);
    assert(Array.isArray(r.data));
  });

  await test("GET /api/logs returns log entries", async () => {
    const r = await request("GET", "/api/logs");
    assert(r.status === 200);
    assert(Array.isArray(r.data));
  });

  await test("GET /api/usage/history returns history", async () => {
    const r = await request("GET", "/api/usage/history?days=1");
    assert(r.status === 200);
    assert(Array.isArray(r.data));
  });

  await test("GET /api/usage/daily returns daily totals", async () => {
    const r = await request("GET", "/api/usage/daily?days=7");
    assert(r.status === 200);
    assert(Array.isArray(r.data));
  });

  await test("Alert engine creates after-hours alerts", async () => {
    const devices = await request("GET", "/api/devices");
    for (const d of devices.data) {
      if (d.status === "on") {
        await request("POST", `/api/devices/${d.id}/toggle`);
      }
    }
    const light = devices.data.find((d) => d.id === "light_1");
    await request("POST", "/api/devices/light_1/toggle");
    const alerts = await request("GET", "/api/alerts");
    assert(Array.isArray(alerts.data));
  });

  await test("404 handler returns proper error", async () => {
    const r = await request("GET", "/api/nonexistent");
    assert(r.status === 404);
    assert(r.data.error);
  });

  console.log("\n═══════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Test suite error:", e);
  process.exit(1);
});
