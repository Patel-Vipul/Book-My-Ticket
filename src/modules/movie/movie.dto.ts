import z from "zod";

const registerMovieDto = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Movie title must be under 50 characters"),

  description: z.string().trim().optional(),

  durationInMinutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  thumbnailUrl: z.string().url("Must be a valid URL").optional(),

  totalSeats: z
    .number()
    .int("Total seats must be a whole number")
    .min(1, "Must have at least 1 seat")
    .max(100, "Cannot exceed 100 seats")
    .default(25),
});

const putMovieDto = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Movie title must be under 50 characters"),

  description: z.string().trim().optional(),

  durationInMinutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  thumbnailUrl: z.string().url("Must be a valid URL").optional(),

  totalSeats: z
    .number()
    .int("Total seats must be a whole number")
    .min(1, "Must have at least 1 seat")
    .max(100, "Cannot exceed 100 seats")
    .default(25),
});
const patchMovieDto = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(50, "Movie title must be under 50 characters")
    .optional(),

  description: z.string().trim().optional(),

  duration_in_minutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0")
    .optional(),

  thumnail_url: z.string().url("Must be a valid URL").optional(),

  total_seats: z
    .number()
    .int("Total seats must be a whole number")
    .min(1, "Must have at least 1 seat")
    .max(100, "Cannot exceed 100 seats")
    .default(25)
    .optional(),
});

export { registerMovieDto, putMovieDto, patchMovieDto };
