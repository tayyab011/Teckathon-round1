const { Router } = require("express");
const aiService = require("../services/aiService");
const deviceService = require("../services/deviceService");
const usageService = require("../services/usageService");
const alertService = require("../services/alertService");

const router = Router();

router.get("/recommendation", async (req, res) => {
  const usage = usageService.getCurrentData();
  const alerts = alertService.getActive();
  const devices = deviceService.getAll();
  const recommendation = await aiService.generateRecommendation(usage, alerts, devices);
  res.json({ recommendation });
});

router.get("/health-summary", async (req, res) => {
  const usage = usageService.getCurrentData();
  const summary = await aiService.generateOfficeHealthSummary(usage);
  res.json({ summary });
});

router.get("/efficiency-score", (req, res) => {
  const usage = usageService.getCurrentData();
  const devices = deviceService.getAll();
  const score = aiService.getEfficiencyScore(usage, devices);
  res.json({ score });
});

router.get("/daily-report", async (req, res) => {
  const usage = usageService.getCurrentData();
  const alerts = alertService.getActive();
  const devices = deviceService.getAll();
  const report = await aiService.generateDailyReport(usage, alerts, devices);
  res.json(report);
});

module.exports = router;
