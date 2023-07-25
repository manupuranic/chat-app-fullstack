const express = require("express");
const userAuthentication = require("../middleware/auth");
const groupController = require("../controllers/group");

const router = express.Router();

router.get(
  "/",
  userAuthentication.authenticateToken,
  groupController.getGroups
);

router.get(
  "/getmembers",
  userAuthentication.authenticateToken,
  groupController.getMembers
);

router.get(
  "/getNonMembers",
  userAuthentication.authenticateToken,
  groupController.getNonMembers
);

module.exports = router;
