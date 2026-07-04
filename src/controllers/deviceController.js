const deviceService = require("../services/deviceService");
const { createError } = require("../middleware/errorHandler");

function listDevices(req, res) {
  const devices = deviceService.getAll();
  const { room, type, status } = req.query;
  let filtered = devices;
  if (room) filtered = filtered.filter((d) => d.room.toLowerCase() === room.toLowerCase());
  if (type) filtered = filtered.filter((d) => d.type === type);
  if (status) filtered = filtered.filter((d) => d.status === status);
  res.json(filtered);
}

function getDeviceById(req, res, next) {
  const device = deviceService.getById(req.params.id);
  if (!device) return next(createError(404, "Device not found"));
  res.json(device);
}

function listByRoom(req, res) {
  const devices = deviceService.getByRoom(req.roomName);
  res.json(devices);
}

function toggleDevice(req, res, next) {
  const result = deviceService.toggle(req.params.id);
  if (!result) return next(createError(404, "Device not found"));
  req.app.get("io").emit("device_update", deviceService.getAll());
  req.app.get("io").emit("usage_update", req.app.get("usageData")());
  res.json(result);
}

module.exports = { listDevices, getDeviceById, listByRoom, toggleDevice };
