const onboardingService =
  require("../services/onboarding.service");

const onboard = async (req, res) => {
  const customer =
    await onboardingService.onboardCustomer({
      customerId:
        req.user.customerId,

      ...req.body
    });

  res.status(200).json({
    success: true,
    message:
      "Customer verification successful",
    customer
  });
};

module.exports = {
  onboard
};