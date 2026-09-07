const express = require("express");

const authenticate =
  require("../middlewares/auth");

const validate =
  require("../middlewares/validate");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  transferSchema
} = require("../validators/transaction.validator");

const {
  transfer,
  getStatus,
  getHistory
} = require("../controllers/transaction.controller");

const router = express.Router();

router.post(
  "/transfer",
  authenticate,
  validate(transferSchema),
  asyncHandler(transfer)
);

router.get(
  "/history",
  authenticate,
  asyncHandler(getHistory)
);

router.get(
  "/:transactionId",
  authenticate,
  asyncHandler(getStatus)
);

module.exports = router;