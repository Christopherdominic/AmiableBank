const express = require("express");

const validate =
  require("../middlewares/validate");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  registerSchema,
  loginSchema
} = require("../validators/auth.validator");

const {
  register,
  login
} = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login)
);

module.exports = router;