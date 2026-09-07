const prisma = require("../config/database");
const nibssService = require("./nibss.service");
const AppError = require("../utils/AppError");

const onboardCustomer = async ({
  customerId,
  name,
  email,
  kycType,
  kycID,
  dob
}) => {
  const customer =
    await prisma.customer.findUnique({
      where: { id: customerId }
    });

  if (!customer) {
    throw new AppError(
      "Customer not found",
      404
    );
  }

  if (customer.isVerified) {
    throw new AppError(
      "Customer is already verified",
      409
    );
  }

  const existingKyc =
    await prisma.customer.findUnique({
      where: { kycID }
    });

  if (
    existingKyc &&
    existingKyc.id !== customerId
  ) {
    throw new AppError(
      "This KYC ID is already registered",
      409
    );
  }

  let verification;

  if (kycType === "bvn") {
    verification =
      await nibssService.validateBvn(kycID);
  } else {
    verification =
      await nibssService.validateNin(kycID);
  }

  if (!verification.valid) {
    throw new AppError(
      `${kycType.toUpperCase()} verification failed`,
      400
    );
  }

  const updatedCustomer =
    await prisma.customer.update({
      where: {
        id: customerId
      },
      data: {
        name,
        email,
        kycType,
        kycID,
        dateOfBirth: new Date(dob),
        isVerified: true
      }
    });

  return {
    id: updatedCustomer.id,
    name: updatedCustomer.name,
    email: updatedCustomer.email,
    kycType: updatedCustomer.kycType,
    isVerified: updatedCustomer.isVerified
  };
};

module.exports = {
  onboardCustomer
};