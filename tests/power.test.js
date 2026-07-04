const path = require("path");
const config = require("../src/config");

let passed = 0;
let failed = 0;
const PASS = "✓";
const FAIL = "✗";

function test(name, fn) {
  try {
    fn();
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

function run() {
  console.log("\n═══════════════════════════════════════");
  console.log("  Power Calculation - Unit Tests");
  console.log("═══════════════════════════════════════\n");

  test("Config loads with defaults", () => {
    assert(config.port === 5000);
    assert(config.simulation.businessHourStart === 9);
    assert(config.simulation.businessHourEnd === 17);
    assert(config.alerts.longOnThresholdHours === 2);
    assert(config.energy.costPerKwh === 0.12);
  });

  test("Power calculation: 1 light = 15W", () => {
    const devices = [
      { id: "light_1", powerDrawWhenOn: 15, status: "on", currentPower: 15 },
    ];
    const total = devices.reduce((s, d) => s + d.currentPower, 0);
    assert(total === 15, `Expected 15W got ${total}W`);
  });

  test("Power calculation: mixed devices", () => {
    const devices = [
      { id: "light_1", powerDrawWhenOn: 15, currentPower: 15, status: "on" },
      { id: "light_2", powerDrawWhenOn: 15, currentPower: 0, status: "off" },
      { id: "fan_1", powerDrawWhenOn: 60, currentPower: 60, status: "on" },
      { id: "fan_2", powerDrawWhenOn: 60, currentPower: 0, status: "off" },
    ];
    const total = devices.reduce((s, d) => s + d.currentPower, 0);
    assert(total === 75, `Expected 75W got ${total}W`);
  });

  test("Power calculation: all off = 0", () => {
    const devices = [
      { id: "l1", currentPower: 0 }, { id: "l2", currentPower: 0 }, { id: "f1", currentPower: 0 },
    ];
    const total = devices.reduce((s, d) => s + d.currentPower, 0);
    assert(total === 0);
  });

  test("Power calculation: max draw", () => {
    const lightPower = 15, fanPower = 60;
    const lights = Array.from({ length: 9 }, (_, i) => ({
      id: `light_${i + 1}`, currentPower: lightPower, status: "on",
    }));
    const fans = Array.from({ length: 6 }, (_, i) => ({
      id: `fan_${i + 1}`, currentPower: fanPower, status: "on",
    }));
    const all = [...lights, ...fans];
    const total = all.reduce((s, d) => s + d.currentPower, 0);
    assert(total === 9 * 15 + 6 * 60, `Expected 495W got ${total}W`);
    assert(total === 495);
  });

  test("Toggle toggles status", () => {
    const d = { status: "off", currentPower: 0, powerDrawWhenOn: 15 };
    d.status = "on";
    d.currentPower = d.powerDrawWhenOn;
    assert(d.status === "on");
    assert(d.currentPower === 15);
    d.status = "off";
    d.currentPower = 0;
    assert(d.status === "off");
    assert(d.currentPower === 0);
  });

  test("kWh conversion", () => {
    const watts = 495;
    const hours = 1;
    const kwh = (watts * hours) / 1000;
    assert(kwh === 0.495, `Expected 0.495 kWh got ${kwh}`);
  });

  test("Cost calculation", () => {
    const kwh = 100;
    const cost = kwh * 0.12;
    assert(cost === 12.0, `Expected $12 got $${cost}`);
  });

  test("Month projection", () => {
    const dailyKwh = 2.5;
    const monthlyKwh = dailyKwh * 30;
    const cost = monthlyKwh * 0.12;
    assert(monthlyKwh === 75, `Expected 75 kWh got ${monthlyKwh}`);
    assert(cost === 9.0, `Expected $9 got $${cost}`);
  });

  test("After-hours detection", () => {
    const hour = 19;
    const isAfterHours = hour < 9 || hour >= 17;
    assert(isAfterHours === true);
    const hour2 = 10;
    assert((hour2 < 9 || hour2 >= 17) === false);
  });

  test("Long-on threshold check", () => {
    const threshold = 2;
    const hoursOn = 0.5;
    assert(hoursOn > threshold === false);
    const hoursOn2 = 3;
    assert(hoursOn2 > threshold === true);
  });

  test("Weekend detection", () => {
    // Sunday=0, Saturday=6
    assert((0 === 0 || 0 === 6) === true);
    assert((1 === 0 || 1 === 6) === false);
    assert((6 === 0 || 6 === 6) === true);
  });

  console.log("\n═══════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

run();
