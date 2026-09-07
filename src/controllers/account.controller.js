const accountService =
  require("../services/account.service");

const createAccount = async (
  req,
  res
) => {
  const account =
    await accountService.createAccount(
      req.user.customerId
    );

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    account
  });
};

const getMyAccount = async (
  req,
  res
) => {
  const account =
    await accountService.getMyAccount(
      req.user.customerId
    );

  res.status(200).json({
    success: true,
    account
  });
};

const nameEnquiry = async (
  req,
  res
) => {
  const result =
    await accountService.nameEnquiry(
      req.user.customerId,
      req.params.accountNumber
    );

  res.status(200).json({
    success: true,
    result
  });
};

const getBalance = async (
  req,
  res
) => {
  const result =
    await accountService.getBalance(
      req.user.customerId
    );

  res.status(200).json({
    success: true,
    ...result
  });
};

module.exports = {
  createAccount,
  getMyAccount,
  nameEnquiry,
  getBalance
};