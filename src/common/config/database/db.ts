import pg, { Pool } from "pg"

// const pool = new pg.Pool({
//     host : process.env.DB_HOST,
//     port : Number(process.env.DB_PORT),
//     user : process.env.DB_USER,
//     password : process.env.DB_PASSWORD,
//     database : process.env.DB_NAME,
//     max : 20
// })

const pool = new Pool({
    connectionString : process.env.DB_URL,
    ssl : {
        rejectUnauthorized : false
    }
})

export default pool