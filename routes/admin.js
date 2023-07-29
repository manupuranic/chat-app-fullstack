const express = require("express");
const userAuthentication = require("../middleware/auth");
const adminController = require("../controllers/admin");

const router = express.Router();

router.get(
  "/",
  userAuthentication.authenticateToken,
  adminController.makeAdmin
);

router.delete(
  "/",
  userAuthentication.authenticateToken,
  adminController.removeAdmin
);

module.exports = router;
