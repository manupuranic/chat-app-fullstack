const express = require("express");
const userAuthentication = require("../middleware/auth");
const adminController = require("../controllers/admin");

const router = express.Router();

router.get(
  "/make-admin",
  userAuthentication.authenticateToken,
  adminController.makeAdmin
);

router.get(
  "/remove-admin",
  userAuthentication.authenticateToken,
  adminController.removeAdmin
);

module.exports = router;
