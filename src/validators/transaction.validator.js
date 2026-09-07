const { z } = require("zod");

const transferSchema = z.object({
  to: z.string().min(1),

  amount: z
    .number()
    .positive()
});

module.exports = {
  transferSchema
};