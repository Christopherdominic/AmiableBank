const express = require("express");

const authenticate =
  require("../middlewares/auth");

const validate =
  require("../middlewares/validate");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  onboardingSchema
} = require("../validators/onboarding.validator");

const {
  onboard
} = require("../controllers/onboarding.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validate(onboardingSchema),
  asyncHandler(onboard)
);

module.exports = router;