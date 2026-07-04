const usageService = require("../services/usageService");

function getUsage(req, res) {
  res.json(usageService.getCurrentData());
}

function getHistory(req, res) {
  const days = parseInt(req.query.days, 10) || 7;
  const data = usageService.getHistorical(Math.min(days, 90));
  res.json(data);
}

function getDailyTotals(req, res) {
  const days = parseInt(req.query.days, 10) || 30;
  const data = usageService.getDailyTotals(Math.min(days, 365));
  res.json(data);
}

module.exports = { getUsage, getHistory, getDailyTotals };
