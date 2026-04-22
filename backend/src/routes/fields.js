const express = require("express");
const router = express.Router();
const { authenticate, authorise } = require("../middleware/auth");
const {
  getAllFields,
  getMyFields,
  createField,
  updateField,
  getAgents,
  getDashboard,
} = require("../controllers/fieldsController");

router.get("/dashboard", authenticate, getDashboard);
router.get("/agents", authenticate, authorise("admin"), getAgents);
router.get("/", authenticate, authorise("admin"), getAllFields);
router.get("/mine", authenticate, authorise("agent"), getMyFields);
router.post("/", authenticate, authorise("admin"), createField);
router.put("/:id", authenticate, authorise("admin"), updateField);

module.exports = router;
