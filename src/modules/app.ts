import express from "express";
import type { Express } from "express";
import authRouter from "./auth/auth.route.js";
import errorHandler from "../common/middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const expressApplication = (): Express => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser())

  //auth router
  app.use("/auth", authRouter);

  app.use(errorHandler)

  return app;
};

export default expressApplication;
