import http from "node:http"
import "dotenv/config"
import expressApplication from "./modules/app.js"
import pool from "./common/config/database/db.js"

const PORT = process.env.PORT || 8080

async function main() {
    try {
        //creates a server
        const server = http.createServer(expressApplication())

        //database connection
        const result = await pool.query("SELECT NOW()")
        console.log("Database is connected Successfully! \n", result.rows[0].now)

        //listen on port
        server.listen(PORT, () => {
            console.log(`Server is running on PORT: ${PORT} at ${process.env.NODE_ENV} mode`)
        })
    } catch (error) {
        console.log("Failed to start server ", error)
        process.exit(1)
    }
}

main()