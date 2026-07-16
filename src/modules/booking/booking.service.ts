import pool from "../../common/config/database/db.js";
import ApiError from "../../common/utils/api.error.js";

const processBookingService = async (payload, userId) => {
  const { seatId } = payload;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const checkSeatQuery = `
        SELECT id FROM seats WHERE id=$1 AND is_available=$2 FOR UPDATE
    `;

    const checkSeatResult = await client.query(checkSeatQuery, [seatId, true]);
    if (checkSeatResult.rows.length === 0) {
      throw ApiError.conflict("Seat not exists or already booked!");
    }

    const checkBookingQuery = `
        SELECT id FROM bookings
        WHERE seat_id = $1 
        AND (
            status = 'confirmed'
            OR
            (status = 'pending'
            AND 
            expired_at > NOW())
        )
    `;

    const checkBookingResult = await client.query(checkBookingQuery, [seatId]);
    if (checkBookingResult.rows.length > 0) {
      throw ApiError.conflict("seat is already booked or reserved");
    }

    const bookingId = crypto.randomUUID();
    const insertBookingQuery = `
        INSERT INTO bookings (id,status, expired_at, user_id, seat_id)
        VALUES ($1,$2,NOW() + INTERVAL '10 minutes',$3,$4)
        RETURNING id, status, expired_at, user_id, seat_id
    `;

    const insertBookingResult = await client.query(insertBookingQuery, [
      bookingId,
      "pending",
      userId,
      seatId,
    ]);

    await client.query("UPDATE seats SET is_available = false WHERE id=$1", [
      seatId,
    ]);

    await client.query("COMMIT");

    if (insertBookingResult.rows.length === 0) {
      throw ApiError.internal("Internal server error, Please try-again");
    }

    return insertBookingResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const confirmBookingService = async (bookingId, userId: string) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const searchBookingQuery = `
            SELECT id, status, user_id, expired_at < NOW() as is_expired
            FROM bookings
            WHERE id = $1
            FOR UPDATE
        `;

    const searchBookingResult = await client.query(searchBookingQuery, [
      bookingId,
    ]);

    if (searchBookingResult.rows.length === 0) {
      throw ApiError.notFound("booking does not exists!");
    }

    const { id, status, user_id, is_expired } = searchBookingResult.rows[0];

    if (user_id !== userId) {
      throw ApiError.forbidden("user is not allowed to book");
    }
    if (is_expired) {
      throw ApiError.conflict("Booking has already expired!");
    }
    if (status !== "pending") {
      throw ApiError.conflict("Only pending bookings can be confirmed");
    }

    const updateBookingQuery = `
            UPDATE bookings
            SET status = 'confirmed', expired_at = NULL, confirmed_at = NOW()
            WHERE id = $1
            RETURNING id, status, confirmed_at, user_id, seat_id
        `;

    const updateBookingResult = await client.query(updateBookingQuery, [id]);

    await client.query("COMMIT");

    return updateBookingResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const cancelBookingService = async (userId, bookingId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const checkBookingQuery = `
            SELECT id, status, confirmed_at, user_id, seat_id
            FROM bookings 
            WHERE id=$1
            FOR UPDATE
        `;
    const checkBookingResult = await client.query(checkBookingQuery, [
      bookingId,
    ]);

    if (checkBookingResult.rows.length === 0) {
      throw ApiError.notFound("Invalid booking id, Booking does not exists");
    }

    const { id, status, user_id, seat_id } = checkBookingResult.rows[0];

    if (userId !== user_id) {
      throw ApiError.forbidden("Not allowed to cancel booking");
    }

    if (status === "cancelled") {
      throw ApiError.conflict("booking is already cancelled");
    }
    const updateBookingResult = await client.query(
      "UPDATE bookings SET status='cancelled', expired_at=NULL WHERE id=$1 RETURNING id,status,user_id",
      [id],
    );

    const updateSeatResult = await client.query(
      "UPDATE seats SET is_available=true WHERE id=$1 RETURNING id, seat_number, is_available",
      [seat_id],
    );

    await client.query("COMMIT");

    return {
      booking: updateBookingResult.rows[0],
      seat: updateSeatResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getMyBookingService = async (userId: string) => {
  const getBookingQuery = `
    SELECT 
      b.id as booking_id,
      b.status,
      b.confirmed_at,
      b.expired_at,
      b.created_at,
      s.seat_number,
      m.title AS movie_title
    FROM bookings AS b
    JOIN seats AS s ON b.seat_id = s.id
    JOIN movies AS m ON s.movie_id = m.id
    WHERE user_id = $1
    ORDER BY b.created_at DESC
  `;

  const getBookingResult = await pool.query(getBookingQuery, [userId]);

  if (getBookingResult.rows.length === 0) {
    return [];
  }

  return getBookingResult.rows.map((row) => ({
    bookingId: row.booking_id,
    movieTitle: row.movie_title,
    seatNumber: row.seat_number,
    status: row.status,
    confirmedAt: row.confirmed_at,
    expiredAt: row.expired_at,
    createdAt: row.created_at,
  }));
};
export {
  processBookingService,
  confirmBookingService,
  cancelBookingService,
  getMyBookingService,
};
