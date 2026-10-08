//Load environment variables from .env
require("dotenv").config()
const app = require("./src/app") // Import the Express application from app.js
const connectToDB = require("./src/config/database")



async function startServer() {
    while (true) {
        try {
            await connectToDB()
            const port = process.env.PORT || 3000
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`)
            })
            return
        } catch {
            console.error("Database unavailable. Retrying connection in 5 seconds...")
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
    }
}

startServer()