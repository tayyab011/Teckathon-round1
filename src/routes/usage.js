const { Router } = require("express");
const usageController = require("../controllers/usageController");

const router = Router();

router.get("/", usageController.getUsage);
router.get("/history", usageController.getHistory);
router.get("/daily", usageController.getDailyTotals);

module.exports = router;
