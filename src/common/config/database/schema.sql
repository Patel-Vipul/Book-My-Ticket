CREATE TABLE Users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(322) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    refresh_token TEXT,
    role user_type DEFAULT 'user',

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP
)

CREATE TYPE user_type AS ENUM (
    'admin',
    'user'
)

CREATE TABLE Movies (
    id UUID PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    duration_in_minutes INT NOT NULL,
    thumnail_url TEXT,
    total_seats int,
    created_by UUID NOT NULL REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_number VARCHAR(10) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    UNIQUE(movie_id, seat_number)
)