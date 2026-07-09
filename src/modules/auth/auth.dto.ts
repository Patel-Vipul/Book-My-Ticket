import z, { email } from "zod";


const registerDto = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First Name must contain atleast 2 characters!")
    .max(50, "First Name must be under 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be under 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),

  email: z
    .email("please enter a valid email address!")
    .trim()
    .toLowerCase()
    .max(322, "email is too long!"),

  password: z
    .string()
    // .min(8, "Password must be at least 8 characters")
    // .max(16, "Password must be under 16 characters")
    // .regex(/[a-z]/, "Must contain at least one lowercase letter")
    // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    // .regex(/[0-9]/, "Must contain at least one number")
    // .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

    ,role : z
        .string()
        .optional()
});

const loginDto = z.object({
  email: z
    .email("please enter a valid email address!")
    .trim()
    .toLowerCase()
    .max(322, "email is too long!"),

  password: z
    .string()
    // .min(8, "Password must be at least 8 characters")
    // .max(16, "Password must be under 16 characters")
    // .regex(/[a-z]/, "Must contain at least one lowercase letter")
    // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    // .regex(/[0-9]/, "Must contain at least one number")
    // .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
})

export {
    registerDto,
    loginDto
}