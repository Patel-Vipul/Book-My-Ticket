import Router from "express";
import { authenticateUser } from "../auth/auth.middleware.js";
import BookingController from "./booking.controller.js";
import asyncHandler from "../../common/middleware/asynHandler.js";

const bookingRouter = Router();

bookingRouter.post(
  "/",
  authenticateUser,
  asyncHandler(BookingController.processBookingController),
);
bookingRouter.post(
  "/:bookingId/confirm",
  authenticateUser,
  asyncHandler(BookingController.confirmBooking),
);
bookingRouter.delete(
  "/:bookingId/cancel",
  authenticateUser,
  asyncHandler(BookingController.cancelBookingController),
);

bookingRouter.get("/my", authenticateUser, asyncHandler(BookingController.getMybookingsController))
export default bookingRouter;
