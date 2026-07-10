import Router  from "express";
import { authenticateUser, authorizeAdmin } from "../auth/auth.middleware.js";
import asyncHandler from "../../common/middleware/asynHandler.js";
import MovieController from "./movie.controller.js";

const movieRouter = Router()

//public route
movieRouter.get("/", asyncHandler(MovieController.getMoviesController))
movieRouter.get("/:movieId", asyncHandler(MovieController.getMovieByIdController))

//admin route
movieRouter.post("/", authenticateUser, authorizeAdmin, asyncHandler(MovieController.registerMovieControler))

export default movieRouter;