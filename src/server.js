require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes =
  require("./routes/auth.routes");

const onboardingRoutes =
  require("./routes/onboarding.routes");

const accountRoutes =
  require("./routes/account.routes");

const transactionRoutes =
  require("./routes/transaction.routes");

const requestTimer =
  require("./middlewares/requestTimer");

const errorHandler =
  require("./middlewares/errorHandler");

const app = express();

app.use(helmet());

app.use(cors());

app.use(
  express.json({
    limit: "10kb"
  })
);

app.use(morgan("combined"));

app.use(requestTimer);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    success: false,
    message:
      "Too many requests, please try again later."
  }
});

app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Banking API is running"
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/onboarding",
  onboardingRoutes
);

app.use(
  "/api/accounts",
  accountRoutes
);

app.use(
  "/api/transactions",
  transactionRoutes
);

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }
);

app.use(errorHandler);

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});