import type { Request, Response } from "express";
import { patchMovieDto, putMovieDto, registerMovieDto } from "./movie.dto.js";
import ApiError from "../../common/utils/api.error.js";
import {
  getMovieByIdService,
  getMoviesService,
  getSeatsService,
  registerMovieService,
  getSeatByIdService,
  updateMoviePutService,
  updateMoviePatchService,
  deleteMovieService,
} from "./movie.service.js";
import ApiResponse from "../../common/utils/api.response.js";

class MovieController {
  static async registerMovieControler(req: Request, res: Response) {

    const validatedBody = await registerMovieDto.safeParseAsync(req.body);

    if (!validatedBody.success) {
      throw ApiError.badRequest(
        "Unable to parse request body",
        validatedBody.error.issues.map((issue) => issue.message),
      );
    }
    //@ts-ignore
    const creatorId = req.user.user_id;

    const movie = await registerMovieService(validatedBody.data, creatorId);

    ApiResponse.created(res, movie, "Movie is Regestered successfully!");
    return;
  }

  static async getMoviesController(req: Request, res: Response) {
    const movies = await getMoviesService();

    if (movies.length === 0) {
      ApiResponse.ok(res, [], "No Movies to get");
      return;
    }

    ApiResponse.ok(res, movies, "Movies fetched Successfully!");
    return;
  }

  static async getMovieByIdController(req: Request, res: Response) {
    const movieId = req.params?.movieId;

    const movie = await getMovieByIdService(movieId);

    ApiResponse.ok(res, movie, "Movie fetched successfully!");
    return;
  }

  static async getSeatsController(req: Request, res: Response) {
    const movieId = req.params?.movieId;

    const seats = await getSeatsService(movieId);

    ApiResponse.ok(res, seats, "All seats are fetched");
    return;
  }

  static async getSeatByIdController(req: Request, res: Response) {
    const seatId = req.params?.seatId;

    const seat = await getSeatByIdService(seatId);

    ApiResponse.ok(res, seat, "seat is fetched successfully!");
    return;
  }

  static async updateMoviePutController(req: Request, res: Response) {
    const validatedBody = await putMovieDto.safeParseAsync(req.body);

    if (!validatedBody.success) {
      throw ApiError.badRequest(
        "unable to parse request body",
        validatedBody.error.issues.map((issue) => issue.message),
      );
    }

    //@ts-ignore
    const userId = req?.user.user_id;
    const movieId = req.params?.movieId;

    const updatedMovie = await updateMoviePutService(
      validatedBody.data,
      movieId,
      userId,
    );

    ApiResponse.ok(res, updatedMovie, "Movie is updated");
  }

  static async updateMoviePatchController(req: Request, res: Response) {
    const validatedBody = await patchMovieDto.safeParseAsync(req.body);

    if (!validatedBody.success) {
      throw ApiError.badRequest(
        "Unable to parse request body",
        validatedBody.error.issues.map((issue) => issue.message),
      );
    }

    //@ts-ignore
    const userId = req?.user.user_id;
    const movieId = req.params?.movieId;

    console.log("done 3")
    const updatedMovie = await updateMoviePatchService(
      validatedBody.data,
      movieId,
      userId,
    );

    ApiResponse.ok(res, updatedMovie, "Movie is updated");
    return;
  }

  static async deleteMovieController(req: Request, res: Response) {
    const movieId = req.params?.movieId;

    const movie = await deleteMovieService(movieId);

    if(!movie){
      ApiResponse.ok(res,[], "movie is already deleted or doesnot exists")
      return
    }

    ApiResponse.ok(res, [], "Movie is deleted successfully!");
    return;
  }
}

export default MovieController;
