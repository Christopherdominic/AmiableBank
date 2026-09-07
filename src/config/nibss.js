const required = [
  "NIBSS_BASE_URL",
  "NIBSS_API_KEY",
  "NIBSS_API_SECRET"
];

for (const variable of required) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

module.exports = {
  baseUrl: process.env.NIBSS_BASE_URL,
  apiKey: process.env.NIBSS_API_KEY,
  apiSecret: process.env.NIBSS_API_SECRET
};