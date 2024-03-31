const express = require("express");
const {
  loginUser,
  registerUser,
  getAnyUsers,
} = require("../controllers/userControllers");
const { authVerify } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-all-users", authVerify, getAnyUsers);

router.post("/signup", registerUser);
router.post("/login", loginUser);

module.exports = router;
