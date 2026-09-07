const express = require("express");

const authenticate =
  require("../middlewares/auth");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  createAccount,
  getMyAccount,
  nameEnquiry,
  getBalance
} = require("../controllers/account.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  asyncHandler(createAccount)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(getMyAccount)
);

router.get(
  "/balance",
  authenticate,
  asyncHandler(getBalance)
);

router.get(
  "/name-enquiry/:accountNumber",
  authenticate,
  asyncHandler(nameEnquiry)
);

module.exports = router;