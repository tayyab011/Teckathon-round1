const { Router } = require("express");
const devicesRouter = require("./devices");
const usageRouter = require("./usage");
const alertsRouter = require("./alerts");
const logsRouter = require("./logs");
const aiRouter = require("./ai");

const router = Router();

router.use("/devices", devicesRouter);
router.use("/usage", usageRouter);
router.use("/alerts", alertsRouter);
router.use("/logs", logsRouter);
router.use("/ai", aiRouter);

module.exports = router;
