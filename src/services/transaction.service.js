const prisma = require("../config/database");
const nibssService = require("./nibss.service");
const AppError = require("../utils/AppError");

const transfer = async ({
  customerId,
  to,
  amount
}) => {
  if (amount <= 0) {
    throw new AppError(
      "Transfer amount must be greater than zero",
      400
    );
  }

  const sender =
    await prisma.account.findUnique({
      where: {
        customerId
      }
    });

  if (!sender) {
    throw new AppError(
      "Sender account not found",
      404
    );
  }

  if (Number(sender.balance) < amount) {
    throw new AppError(
      "Insufficient balance",
      400
    );
  }

  if (sender.accountNumber === to) {
    throw new AppError(
      "You cannot transfer to your own account",
      400
    );
  }

  /*
   * Requirement says:
   * perform name enquiry and identity validation
   * before transfer.
   *
   * The NIBSS transfer endpoint handles the
   * actual external transfer.
   */

  const recipient =
    await prisma.account.findUnique({
      where: {
        accountNumber: to
      }
    });

  const enquiry =
    await nibssService.nameEnquiry(to);

  if (!enquiry) {
    throw new AppError(
      "Recipient account could not be verified",
      400
    );
  }

  const nibssResult =
    await nibssService.transfer({
      from: sender.accountNumber,
      to,
      amount
    });

  if (!nibssResult.transactionId) {
    throw new AppError(
      "NIBSS did not return a transaction ID",
      502
    );
  }

  const status =
    nibssResult.status?.toLowerCase() ===
    "successful"
      ? "successful"
      : "pending";

  /*
   * If recipient is one of our locally created
   * accounts, update our local balances too.
   */
  if (
    status === "successful" &&
    recipient
  ) {
    await prisma.$transaction(
      async (tx) => {
        await tx.account.update({
          where: {
            accountNumber:
              sender.accountNumber
          },
          data: {
            balance: {
              decrement: amount
            }
          }
        });

        await tx.account.update({
          where: {
            accountNumber: to
          },
          data: {
            balance: {
              increment: amount
            }
          }
        });

        await tx.transaction.create({
          data: {
            transactionId:
              nibssResult.transactionId,

            amount,

            fromAccount:
              sender.accountNumber,

            toAccount: to,

            status
          }
        });
      }
    );
  } else {
    await prisma.transaction.create({
      data: {
        transactionId:
          nibssResult.transactionId,

        amount,

        fromAccount:
          sender.accountNumber,

        toAccount: to,

        status
      }
    });
  }

  return {
    transactionId:
      nibssResult.transactionId,

    status,

    amount,
    from: sender.accountNumber,
    to
  };
};

const getTransactionStatus = async (
  customerId,
  transactionId
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

  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,

        OR: [
          {
            fromAccount:
              account.accountNumber
          },
          {
            toAccount:
              account.accountNumber
          }
        ]
      }
    });

  if (!transaction) {
    throw new AppError(
      "Transaction not found",
      404
    );
  }

  return nibssService.transactionStatus(
    transactionId
  );
};

const getHistory = async (
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

  return prisma.transaction.findMany({
    where: {
      OR: [
        {
          fromAccount:
            account.accountNumber
        },
        {
          toAccount:
            account.accountNumber
        }
      ]
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

module.exports = {
  transfer,
  getTransactionStatus,
  getHistory
};