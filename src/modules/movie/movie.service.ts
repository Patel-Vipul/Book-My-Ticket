import pool from "../../common/config/database/db.js";
import crypto from "crypto";
import ApiError from "../../common/utils/api.error.js";
import { string } from "zod";

const registerMovieService = async (payload, creatorId) => {
  const { title, description, durationInMinutes, thumbnailUrl, totalSeats } =
    payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const movieId = crypto.randomUUID();

    const insertMovieQuery = `
            INSERT INTO movies (id,title,description, duration_in_minutes,thumnail_url,total_seats, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id, title, description, duration_in_minutes, thumnail_url, total_seats, created_by;
        `;

    const insertMovieResult = await client.query(insertMovieQuery, [
      movieId,
      title,
      description ?? null,
      durationInMinutes,
      thumbnailUrl ?? null,
      totalSeats,
      creatorId,
    ]);

    const movie = insertMovieResult.rows[0];

    const rows = ["A", "B", "C", "D", "E"];
    const seatRows = 5;

    const seatNumbers = rows.flatMap((row) =>
      Array.from({ length: seatRows }, (_, i) => `${row}${i + 1}`),
    );

    const values: string[] = [];
    const params: unknown[] = [movie.id];
    let paramIndex = 2;

    for (const seatNumber of seatNumbers) {
      values.push(`($1, $${paramIndex}, true)`);
      params.push(seatNumber);
      paramIndex++;
    }

    const batchInsertQuery = `
        INSERT INTO seats (movie_id, seat_number, is_available)
        VALUES ${values.join(", ")}
        RETURNING id, seat_number, is_available
    `;

    const seatResult = await client.query(batchInsertQuery, params);

    await client.query("COMMIT");

    return {
      ...movie,
      seats: seatResult.rows,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getMoviesService = async () => {
  const movieQuery = `
        SELECT id, title, description, duration_in_minutes, thumnail_url, total_seats, created_by
        FROM movies;
    `;

  const moviesResult = await pool.query(movieQuery);

  return moviesResult.rows;
};

const getMovieByIdService = async (movieId) => {
  const getMovieQuery = `
        SELECT id, title, description, duration_in_minutes, thumnail_url, total_seats, created_by 
        FROM movies
        WHERE id=$1
    `;

  const getMovieResult = await pool.query(getMovieQuery, [movieId]);

  if (getMovieResult.rows.length === 0) {
    throw ApiError.notFound("Invalid id or movie does not exists!");
  }

  return getMovieResult.rows[0];
};

const getSeatsService = async (movieId) => {
  const getSeatsQuery = `
        SELECT id, seat_number, is_available, movie_id FROM seats WHERE movie_id=$1
    `;
  const getSeatsResult = await pool.query(getSeatsQuery, [movieId]);

  if (getSeatsResult.rows.length === 0) {
    throw ApiError.notFound("invalid movieId or movie/seats deleted");
  }

  return getSeatsResult.rows;
};

const getSeatByIdService = async (seatId) => {
  const getSeatResult = await pool.query(
    "SELECT id, seat_number, is_available FROM seats WHERE id=$1",
    [seatId],
  );

  if (getSeatResult.rows.length === 0) {
    throw ApiError.notFound("Invalid seat id");
  }

  return getSeatResult.rows[0];
};

const updateMoviePutService = async (payload, movieId, userId) => {
  const {
    title,
    description,
    durationInMinutes,
    thumbnailUrl,
    totalSeats
  } = payload;

  const updateMovieQuery = `
        UPDATE movies 
        SET 
            title = $1,
            description = $2,
            duration_in_minutes = $3,
            thumnail_url = $4,
            total_seats = $5,
            updated_by = $6
        WHERE id = $7
        RETURNING id, title, description, duration_in_minutes, thumnail_url, total_seats, created_by, updated_by
    `;

  const updateMovieResult = await pool.query(updateMovieQuery, [
    title,
    description,
    durationInMinutes,
    thumbnailUrl,
    totalSeats,
    userId,
    movieId,
  ]);


  if (updateMovieResult.rows.length === 0) {
    throw ApiError.notFound("invalid movie id or movie is deleted");
  }

  return updateMovieResult.rows[0];
};

const updateMoviePatchService = async (payload, movieId, userId) => {
  const keys = Object.keys(payload);
  const values = Object.values(payload);

  const setClause = keys
    .map((key, index) => `${key}=$${index + 1}`)
    .join(", ");
  const updateMovieQuery = `
        UPDATE movies 
        SET ${setClause}, updated_by = $${keys.length + 1}
        WhERE id = $${keys.length + 2}
        RETURNING id, title, duration_in_minutes, thumnail_url, total_seats, created_by, updated_by
    `;

  const updateMovieResult = await pool.query(updateMovieQuery, [...values, userId, movieId]);

  if(updateMovieResult.rows.length === 0){
    throw ApiError.notFound("invalid movie id or movie is deleted!")
  }

  return updateMovieResult.rows[0]
};

const deleteMovieService = async (movieId) => {
    const deletMovieQuery = `
        DELETE FROM movies WHERE id=$1
    `;

    const movieQueryResult = await pool.query(deletMovieQuery,[movieId])

    return movieQueryResult.rows[0]
}

export {
  registerMovieService,
  getMoviesService,
  getMovieByIdService,
  getSeatsService,
  getSeatByIdService,
  updateMoviePutService,
  updateMoviePatchService,
  deleteMovieService
};
