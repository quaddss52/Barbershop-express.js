import express from "express";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
import servicesRouter from "./routes/services.js";
import customerRouter from "./routes/customers.js";
import shopHoursRouter from "./routes/shop_hours.js";
import appointmentRouter from "./routes/appointments.js";
import dasboardRouter from "./routes/dashboard.js";
const app = express();

const PORT = 8080;
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// middleware for logging
app.use(logger);

// set up static folder
// app.use(express.static(path.join(__dirname, "public")));
// routes

app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/shopHours", shopHoursRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/dashboard", dasboardRouter);
// app.use("/api/v1/auth", authRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
