const z = require("zod");

const createOfferSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
});

module.exports = { createOfferSchema };