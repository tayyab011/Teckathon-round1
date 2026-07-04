const { Router } = require("express");
const alertController = require("../controllers/alertController");

const router = Router();

router.get("/", alertController.listAlerts);
router.post("/:id/resolve", alertController.resolveAlert);

module.exports = router;
