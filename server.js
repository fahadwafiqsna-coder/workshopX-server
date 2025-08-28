require("dotenv").config();
require("./cronJobs/offerCleanup");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");


const app = express();

const allowedOrigins = [
  // "*",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth.route");
const blogRoutes = require("./routes/blog.route");
const offerRoutes = require("./routes/offer.route");
const userRoutes = require("./routes/user.route");
const contactRoutes = require("./routes/contact.route");
const servicesRoutes = require("./routes/service.route");

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/services", servicesRoutes);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handling
const errorMiddleware = require("./middleware/error.middleware");
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
