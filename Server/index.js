require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// DB connection
const connectDB = require("./Connection/dbconnection");

// Routes
const userRoute = require("./Routes/userRoute");
const adminRoute = require("./Routes/adminRoute");
const eventRoute = require("./Routes/eventRoute");
const eventJoinRoute = require("./Routes/eventjoinRoute");
const donationRoute = require("./Routes/donationRoute");
const donationHistoryRoute = require("./Routes/doantionhistory");

const app = express();

// -------------------- CONNECT DB --------------------
connectDB();

// -------------------- GLOBAL MIDDLEWARE --------------------
app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: /http:\/\/localhost:\d+$/,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------------------- STATIC IMAGE SERVING --------------------
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(
  "/uploads/events",
  express.static(path.join(__dirname, "uploads/events"))
);

// -------------------- ROUTES --------------------

// 🔐 AUTH ROUTES
app.use("/api/auth", userRoute);     // user login/signup
app.use("/api/admin", adminRoute);   // admin login ONLY

// 📅 EVENT ROUTES
app.use("/api", eventRoute);
app.use("/api", eventJoinRoute);

// 💰 DONATION ROUTES
app.use("/api", donationRoute);
app.use("/api", donationHistoryRoute);
app.use('/api', require('./Routes/categoryroute'));

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🎉 Backend is up and running!",
  });
});

// -------------------- 404 HANDLER --------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

});