import type { Request, Response } from "express";
import { processBookingDto } from "./booking.dto.js";
import ApiError from "../../common/utils/api.error.js";
import {
  cancelBookingService,
  confirmBookingService,
  processBookingService,
  getMyBookingService
} from "./booking.service.js";
import ApiResponse from "../../common/utils/api.response.js";

class BookingController {
  static async processBookingController(req: Request, res: Response) {
    const validatedBody = await processBookingDto.safeParseAsync(req.body);
    if (!validatedBody.success) {
      throw ApiError.badRequest(
        "Unable to parse request body",
        validatedBody.error.issues.map((issue) => issue.message),
      );
    }

    //@ts-ignore
    const userId = req.user?.user_id;
    const booking = await processBookingService(validatedBody.data, userId);
    ApiResponse.created(res, booking, "Booking is created successfully!");
    return;
  }

  static async confirmBooking(req: Request, res: Response) {
    const { bookingId } = req.params;

    //@ts-ignore
    const userId = req.user.user_id;

    const booking = await confirmBookingService(bookingId, userId);

    ApiResponse.ok(res, booking, "Booking is confirmed successfully!");
    return;
  }

  static async cancelBookingController(req: Request, res: Response) {
    //@ts-ignore
    const userId = req.user?.user_id;

    const { bookingId } = req.params;

    const { booking, seat } = await cancelBookingService(userId, bookingId);

    ApiResponse.ok(
      res,
      { booking, seat },
      "Booking is cancelled successfully!",
    );
    return;
  }

  static async getMybookingsController (req: Request, res: Response) {
    //@ts-ignore
    const userId = req.user.user_id;

    const bookings = await getMyBookingService(userId);
    ApiResponse.ok(res, bookings, "All bookings fetched successfully!")
    return
  }
}

export default BookingController
