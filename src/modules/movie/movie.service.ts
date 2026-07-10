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
            INSERT INTO movies (id,title,description, duration_in_minutes,thumbnail_url,total_seats, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id, title, description, duration_in_minutes, thumbnail_url, total_seats, created_by;
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
        SELECT id, title, description, duration_in_minutes, thumbnail_url, total_seats, created_by
        FROM movies;
    `;

    const moviesResult = await pool.query(movieQuery)

    return moviesResult.rows
};

export { registerMovieService, getMoviesService };
