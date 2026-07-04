const { ROOMS } = require("../config/constants");
const { createError } = require("./errorHandler");

function validateDeviceId(req, res, next) {
  const { id } = req.params;
  if (!id || !/^(light|fan)_\d+$/.test(id)) {
    return next(createError(400, "Invalid device ID format"));
  }
  next();
}

function validateRoomName(req, res, next) {
  const roomParam = req.params.room || req.body.room;
  if (!roomParam) return next(createError(400, "Room name is required"));
  const resolved = roomParam.replace(/[-_]/g, " ");
  const match = ROOMS.find((r) => r.toLowerCase() === resolved.toLowerCase());
  if (!match) {
    return next(createError(404, `Room not found. Valid rooms: ${ROOMS.join(", ")}`));
  }
  req.roomName = match;
  next();
}

function validateLimit(req, res, next) {
  if (req.query.limit) {
    const limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) {
      return next(createError(400, "Limit must be a positive integer"));
    }
  }
  next();
}

module.exports = { validateDeviceId, validateRoomName, validateLimit };
