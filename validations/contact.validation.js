const z = require("zod");

const createContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  vehicleModel: z.string().min(2, "Vehicle model is required"),
});

module.exports = { createContactSchema };