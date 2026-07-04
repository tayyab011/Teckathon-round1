const { getDb } = require("../db");
const { MAX_LOG_LIMIT, DEFAULT_LOG_LIMIT } = require("../config/constants");

function getLogs(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LOG_LIMIT, MAX_LOG_LIMIT);
  const { device_id, action } = req.query;
  let query = "SELECT * FROM logs WHERE 1=1";
  const params = [];

  if (device_id) {
    query += " AND device_id = ?";
    params.push(device_id);
  }
  if (action) {
    query += " AND action = ?";
    params.push(action);
  }

  query += " ORDER BY id DESC LIMIT ?";
  params.push(limit);

  const logs = getDb().prepare(query).all(...params);
  res.json(logs);
}

module.exports = { getLogs };
