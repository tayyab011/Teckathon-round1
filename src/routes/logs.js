const { Router } = require("express");
const logController = require("../controllers/logController");
const { validateLimit } = require("../middleware/validation");

const router = Router();

router.get("/", validateLimit, logController.getLogs);

module.exports = router;
