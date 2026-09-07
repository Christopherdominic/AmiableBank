const transactionService =
  require("../services/transaction.service");

const transfer = async (
  req,
  res
) => {
  const result =
    await transactionService.transfer({
      customerId:
        req.user.customerId,

      to: req.body.to,
      amount: req.body.amount
    });

  res.status(200).json({
    success: true,
    message: "Transfer processed",
    transaction: result
  });
};

const getStatus = async (
  req,
  res
) => {
  const result =
    await transactionService
      .getTransactionStatus(
        req.user.customerId,
        req.params.transactionId
      );

  res.status(200).json({
    success: true,
    transaction: result
  });
};

const getHistory = async (
  req,
  res
) => {
  const transactions =
    await transactionService.getHistory(
      req.user.customerId
    );

  res.status(200).json({
    success: true,
    transactions
  });
};

module.exports = {
  transfer,
  getStatus,
  getHistory
};