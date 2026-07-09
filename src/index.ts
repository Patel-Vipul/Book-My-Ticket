import http from "node:http"
import "dotenv/config"

const PORT = process.env.PORT || 8080

async function main() {
    try {
        //creates a server
        const server = http.createServer()

        //database connection

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