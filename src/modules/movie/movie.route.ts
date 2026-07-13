import Router  from "express";
import { authenticateUser, authorizeAdmin } from "../auth/auth.middleware.js";
import asyncHandler from "../../common/middleware/asynHandler.js";
import MovieController from "./movie.controller.js";

const movieRouter = Router()

//public route
movieRouter.get("/", asyncHandler(MovieController.getMoviesController))
movieRouter.get("/:movieId", asyncHandler(MovieController.getMovieByIdController))
movieRouter.get("/:movieId/seats",asyncHandler(MovieController.getSeatsController))
movieRouter.get("/:movieId/seats/:seatId",asyncHandler(MovieController.getSeatByIdController))

//admin route
movieRouter.post("/", authenticateUser, authorizeAdmin, asyncHandler(MovieController.registerMovieControler))
movieRouter.put("/:movieId", authenticateUser, authorizeAdmin, asyncHandler(MovieController.updateMoviePutController))
movieRouter.patch("/:movieId", authenticateUser, authorizeAdmin, asyncHandler(MovieController.updateMoviePatchController))
movieRouter.delete("/:movieId", authenticateUser, authorizeAdmin, asyncHandler(MovieController.deleteMovieController))

export default movieRouter;