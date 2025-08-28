// require("dotenv").config();
// require("./cronJobs/offerCleanup");
// const express = require("express");
// const connectDB = require("./config/db");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./swagger.json");


// const app = express();

// const allowedOrigins = [
//   // "*",
//   "http://localhost:3000",
//   process.env.FRONTEND_URL,
// ];

// // Middleware
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// const authRoutes = require("./routes/auth.route");
// const blogRoutes = require("./routes/blog.route");
// const offerRoutes = require("./routes/offer.route");
// const userRoutes = require("./routes/user.route");
// const contactRoutes = require("./routes/contact.route");
// const servicesRoutes = require("./routes/service.route");

// app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);
// app.use("/api/offers", offerRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/contacts", contactRoutes);
// app.use("/api/services", servicesRoutes);

// // Swagger Docs
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // Error Handling
// const errorMiddleware = require("./middleware/error.middleware");
// app.use(errorMiddleware);

// // Start server
// const PORT = process.env.PORT || 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });



// server.js
require("dotenv").config();
require("./cronJobs/offerCleanup");

const { randomUUID } = require("crypto");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// -------------------------------------
// App bootstrap
// -------------------------------------
const app = express();
app.set("trust proxy", 1); // behind Render/Vercel proxy

// -------------------------------------
// Build allowed origins (CORS)
// -------------------------------------
const stripTrailingSlash = (s) => (s ? s.replace(/\/+$/, "") : s);

const fromEnvList =
  (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((s) => stripTrailingSlash(s.trim()))
    .filter(Boolean) || [];

const singleFrontEnd = stripTrailingSlash(process.env.FRONTEND_URL);

const allowedOrigins = [
  "http://localhost:3000",
  singleFrontEnd,
  ...fromEnvList,
].filter(Boolean);

const ALLOW_VERCEL_PREVIEWS =
  (process.env.ALLOW_VERCEL_PREVIEWS || "true").toLowerCase() === "true";

// Log what we’re allowing on boot
console.log("[BOOT] Allowed origins:", allowedOrigins);
console.log("[BOOT] Allow Vercel preview *.vercel.app:", ALLOW_VERCEL_PREVIEWS);

// -------------------------------------
// Logging (request ID + origin + response time)
// -------------------------------------
app.use((req, _res, next) => {
  req.id = randomUUID();
  next();
});

morgan.token("id", (req) => req.id);
morgan.token("origin", (req) => req.headers.origin || "-");

app.use(
  morgan(
    ':date[iso] :id :remote-addr ":method :url" :status :res[content-length] - :response-time ms origin=:origin'
  )
);

// -------------------------------------
// CORS (must be before routes)
// -------------------------------------
const corsOptions = {
  origin(origin, cb) {
    // Allow server-to-server / tools (no Origin header)
    if (!origin) return cb(null, true);

    const normalized = stripTrailingSlash(origin);
    const isExact = allowedOrigins.includes(normalized);
    const isVercelPreview =
      ALLOW_VERCEL_PREVIEWS && /\.vercel\.app$/i.test(normalized);

    if (isExact || isVercelPreview) return cb(null, true);

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Preflight fast-path
app.options("*", cors(corsOptions));

// -------------------------------------
// Security & parsers
// -------------------------------------
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// -------------------------------------
// Routes
// -------------------------------------
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

// Health check (useful on Render)
app.get("/healthz", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// -------------------------------------
// 404 handler (after all routes)
// -------------------------------------
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl} (id=${req.id})`);
  res.status(404).json({
    status: "error",
    message: "Route not found",
    requestId: req.id,
  });
});

// -------------------------------------
// Error handler (last)
// -------------------------------------
const defaultErrorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  // Log a concise + full error line for later diagnosis
  console.error(
    `[ERR] id=${req.id} status=${status} ${req.method} ${req.originalUrl} origin=${req.headers.origin || "-"}`
  );
  if (err.stack) console.error(err.stack);
  else console.error(err);

  res.status(status).json({
    status: "error",
    message: err.message || "Internal Server Error",
    requestId: req.id,
  });
};

// Use your custom error middleware if present; otherwise fallback
let errorMiddleware = defaultErrorHandler;
try {
  const custom = require("./middleware/error.middleware");
  if (typeof custom === "function") {
    errorMiddleware = custom;
  }
} catch (e) {
  // no-op, keep default
}
app.use(errorMiddleware);

// -------------------------------------
// Start server
// -------------------------------------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("[BOOT] Failed to start server:", err);
    process.exit(1);
  }
})();

// Optional: catch unhandled errors so we can see them in logs on Render
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

