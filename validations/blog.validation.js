const z = require("zod");

const createBlogSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

module.exports = { createBlogSchema };