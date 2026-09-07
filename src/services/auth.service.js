const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../config/database");
const AppError = require("../utils/AppError");

const register = async ({
  name,
  email,
  password
}) => {
  const existing = await prisma.customer.findUnique({
    where: { email }
  });

  if (existing) {
    throw new AppError(
      "Customer with this email already exists",
      409
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash,

      // These will be completed during onboarding.
      kycType: "bvn",
      kycID: `TEMP_${Date.now()}_${Math.random()}`,
      dateOfBirth: new Date("2000-01-01"),

      isVerified: false
    }
  });

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email
  };
};

const login = async ({
  email,
  password
}) => {
  const customer =
    await prisma.customer.findUnique({
      where: { email }
    });

  if (!customer) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const valid = await bcrypt.compare(
    password,
    customer.passwordHash
  );

  if (!valid) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const token = jwt.sign(
    {
      customerId: customer.id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  return {
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      isVerified: customer.isVerified
    }
  };
};

module.exports = {
  register,
  login
};