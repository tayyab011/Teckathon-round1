console.log("═══════════════════════════════════════");
console.log("  Office Energy Management - Test Suite");
console.log("═══════════════════════════════════════\n");

async function runPowerTests() {
  console.log("▶ Power Calculation Tests\n");
  require("./power.test.js");
}

async function runApiTests() {
  console.log("\n▶ API Integration Tests\n");
  require("./api.test.js");
}

const testType = process.argv[2] || "all";

async function main() {
  if (testType === "power" || testType === "all") {
    await runPowerTests();
  }
  if (testType === "api" || testType === "all") {
    await runApiTests();
  }
}

main().catch(e => {
  console.error("Test runner error:", e);
  process.exit(1);
});
