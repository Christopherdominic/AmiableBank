const prisma = require("../config/database");
const nibssService = require("./nibss.service");
const AppError = require("../utils/AppError");

const createAccount = async (
  customerId
) => {
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

  if (!customer.isVerified) {
    throw new AppError(
      "Complete KYC verification first",
      400
    );
  }

  const existingAccount =
    await prisma.account.findUnique({
      where: {
        customerId
      }
    });

  if (existingAccount) {
    throw new AppError(
      "Customer already has an account",
      409
    );
  }

  const nibssAccount =
    await nibssService.createAccount({
      kycType: customer.kycType,
      kycID: customer.kycID,
      dob: customer.dateOfBirth
        .toISOString()
        .split("T")[0]
    });

  if (!nibssAccount.accountNumber) {
    throw new AppError(
      "NIBSS did not return an account number",
      502
    );
  }

  const account =
    await prisma.account.create({
      data: {
        accountNumber:
          nibssAccount.accountNumber,

        bankCode:
          nibssAccount.bankCode || null,

        bankName:
          nibssAccount.bankName || null,

        balance:
          nibssAccount.balance ?? 15000,

        customerId
      }
    });

  return account;
};

const getMyAccount = async (
  customerId
) => {
  const account =
    await prisma.account.findUnique({
      where: {
        customerId
      }
    });

  if (!account) {
    throw new AppError(
      "Account not found",
      404
    );
  }

  return account;
};

const nameEnquiry = async (
  customerId,
  accountNumber
) => {
  // We don't need to expose another customer's
  // local information. NIBSS performs the enquiry.
  await getMyAccount(customerId);

  return nibssService.nameEnquiry(
    accountNumber
  );
};

const getBalance = async (
  customerId
) => {
  const account =
    await getMyAccount(customerId);

  return {
    accountNumber:
      account.accountNumber,

    balance:
      account.balance
  };
};

module.exports = {
  createAccount,
  getMyAccount,
  nameEnquiry,
  getBalance
};