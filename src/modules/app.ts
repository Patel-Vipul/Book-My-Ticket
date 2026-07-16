import express from "express";
import type { Express } from "express";
import authRouter from "./auth/auth.route.js";
import errorHandler from "../common/middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import movieRouter from "./movie/movie.route.js";
import bookingRouter from "./booking/booking.route.js";

const expressApplication = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        "https://book-my-tickett.netlify.app",
        "https://spontaneous-klepon-eaa5bf.netlify.app",
      ],
      credentials: true,
    }),
  );
  //auth router
  app.use("/auth", authRouter);

  //movie-router
  app.use("/movies", movieRouter);

  //booking-router
  app.use("/bookings", bookingRouter);

  app.use(errorHandler);

  return app;
};

export default expressApplication;
