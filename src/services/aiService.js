const config = require("../config");

const AI_PROVIDER = process.env.AI_PROVIDER || "openai";
const AI_API_KEY = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

let aiEnabled = !!AI_API_KEY;

async function generateRecommendation(usageData, alerts, devices) {
  if (!aiEnabled) return fallbackRecommendation(usageData, alerts, devices);

  const prompt = `You are an energy efficiency expert. Based on this office data, give 1-2 concise energy-saving recommendations:
- Total power: ${usageData.totalPowerWatts}W
- Active devices: ${devices.filter(d => d.status === 'on').length}/${devices.length}
- Active alerts: ${alerts.length}
- Today's usage: ${usageData.estimatedKwhToday} kWh
- Rooms: ${JSON.stringify(usageData.rooms)}

Reply with a short paragraph.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || fallbackRecommendation(usageData, alerts, devices);
  } catch {
    return fallbackRecommendation(usageData, alerts, devices);
  }
}

async function generateOfficeHealthSummary(usageData) {
  if (!aiEnabled) return fallbackHealthSummary(usageData);

  const prompt = `Summarize this office's energy health in 1-2 sentences:
- Power: ${usageData.totalPowerWatts}W
- Today: ${usageData.estimatedKwhToday} kWh
- Cost today: $${usageData.estimatedCostToday}
- Projected monthly: $${usageData.estimatedMonthlyCost}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || fallbackHealthSummary(usageData);
  } catch {
    return fallbackHealthSummary(usageData);
  }
}

function getEfficiencyScore(usageData, devices) {
  const totalCapacity = devices.reduce((s, d) => s + d.powerDrawWhenOn, 0);
  const currentLoad = usageData.totalPowerWatts;
  const utilization = totalCapacity > 0 ? currentLoad / totalCapacity : 0;

  const onDevices = devices.filter((d) => d.status === "on").length;
  const totalDevices = devices.length;
  const deviceRatio = totalDevices > 0 ? onDevices / totalDevices : 0;

  const efficiency = Math.round(
    100 - Math.abs(utilization - 0.5) * 100 - Math.abs(deviceRatio - 0.5) * 50
  );

  return Math.max(0, Math.min(100, efficiency));
}

async function generateDailyReport(usageData, alerts, devices) {
  const recommendations = await generateRecommendation(usageData, alerts, devices);
  const health = await generateOfficeHealthSummary(usageData);
  const score = getEfficiencyScore(usageData, devices);

  return {
    summary: health,
    score,
    recommendations,
    data: {
      totalPower: usageData.totalPowerWatts,
      kwhToday: usageData.estimatedKwhToday,
      costToday: usageData.estimatedCostToday,
      monthlyProjection: usageData.estimatedMonthlyCost,
      activeAlerts: alerts.length,
      activeDevices: devices.filter((d) => d.status === "on").length,
    },
    timestamp: new Date().toISOString(),
  };
}

function fallbackRecommendation(usageData, alerts, devices) {
  const active = devices.filter((d) => d.status === "on");
  if (alerts.length > 0) {
    const afterHours = alerts.filter((a) => a.type === "after-hours");
    if (afterHours.length > 0) {
      return `🔌 ${afterHours.length} device(s) are on after hours. Turning them off could save significant energy.`;
    }
  }
  if (usageData.totalPowerWatts > 300) {
    return `⚡ Power usage is high (${usageData.totalPowerWatts}W). Consider turning off unused devices.`;
  }
  return `✅ Office running efficiently at ${usageData.totalPowerWatts}W.`;
}

function fallbackHealthSummary(usageData) {
  const { totalPowerWatts, estimatedKwhToday, estimatedMonthlyCost } = usageData;
  if (totalPowerWatts === 0) return "Office is idle. All devices are off.";
  if (totalPowerWatts > 300) return `Office is active at ${totalPowerWatts}W. Monthly cost projected at $${estimatedMonthlyCost}.`;
  return `Office running efficiently at ${totalPowerWatts}W (${estimatedKwhToday} kWh today).`;
}

module.exports = {
  generateRecommendation,
  generateOfficeHealthSummary,
  getEfficiencyScore,
  generateDailyReport,
};
