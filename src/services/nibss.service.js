const axios = require("axios");
const AppError = require("../utils/AppError");

const {
  baseUrl,
  apiKey,
  apiSecret
} = require("../config/nibss");

let cachedToken = null;
let tokenExpiresAt = 0;

const client = axios.create({
  baseURL: baseUrl,
  timeout: 15000
});

const getAccessToken = async () => {
  const now = Date.now();

  if (
    cachedToken &&
    now < tokenExpiresAt
  ) {
    return cachedToken;
  }

  try {
    const response = await client.post(
      "/api/auth/token",
      {
        apiKey,
        apiSecret
      }
    );

    const token = response.data.token;

    if (!token) {
      throw new AppError(
        "NIBSS did not return an access token",
        502
      );
    }

    cachedToken = token;

    // Refresh before the one-hour expiry.
    tokenExpiresAt =
      Date.now() + 55 * 60 * 1000;

    return cachedToken;

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Unable to authenticate with NIBSS",
      502
    );
  }
};

const validateBvn = async (bvn) => {
  const token = await getAccessToken();

  try {
    const response = await client.post(
      "/api/validateBvn",
      { bvn },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to validate BVN with NIBSS",
      502
    );
  }
};

const validateNin = async (nin) => {
  const token = await getAccessToken();

  try {
    const response = await client.post(
      "/api/validateNin",
      { nin },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to validate NIN with NIBSS",
      502
    );
  }
};

const createAccount = async ({
  kycType,
  kycID,
  dob
}) => {
  const token = await getAccessToken();

  try {
    const response = await client.post(
      "/api/account/create",
      {
        kycType,
        kycID,
        dob
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to create account with NIBSS",
      502
    );
  }
};

const nameEnquiry = async (accountNumber) => {
  const token = await getAccessToken();

  try {
    const response = await client.get(
      `/api/account/name-enquiry/${accountNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to perform name enquiry",
      502
    );
  }
};

const getBalance = async (accountNumber) => {
  const token = await getAccessToken();

  try {
    const response = await client.get(
      `/api/account/balance/${accountNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to retrieve account balance",
      502
    );
  }
};

const transfer = async ({
  from,
  to,
  amount
}) => {
  const token = await getAccessToken();

  try {
    const response = await client.post(
      "/api/transfer",
      {
        from,
        to,
        amount: String(amount)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to process transfer",
      502
    );
  }
};

const transactionStatus = async (
  transactionId
) => {
  const token = await getAccessToken();

  try {
    const response = await client.get(
      `/api/transaction/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;

  } catch (error) {
    throw new AppError(
      "Unable to retrieve transaction status",
      502
    );
  }
};

module.exports = {
  getAccessToken,
  validateBvn,
  validateNin,
  createAccount,
  nameEnquiry,
  getBalance,
  transfer,
  transactionStatus
};