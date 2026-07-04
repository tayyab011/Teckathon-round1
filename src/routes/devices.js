const { Router } = require("express");
const deviceController = require("../controllers/deviceController");
const { validateDeviceId, validateRoomName } = require("../middleware/validation");

const router = Router();

router.get("/", deviceController.listDevices);
router.get("/:id", deviceController.getDeviceById);
router.get("/room/:room", validateRoomName, deviceController.listByRoom);
router.post("/:id/toggle", validateDeviceId, deviceController.toggleDevice);

module.exports = router;
