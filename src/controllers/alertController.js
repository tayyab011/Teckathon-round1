const alertService = require("../services/alertService");
const { createError } = require("../middleware/errorHandler");

function listAlerts(req, res) {
  const { resolved } = req.query;
  if (resolved === "true") return res.json(alertService.getAll());
  res.json(alertService.getActive());
}

function resolveAlert(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return next(createError(400, "Invalid alert ID"));
  alertService.resolve(id);
  res.json({ success: true });
}

module.exports = { listAlerts, resolveAlert };
