const express = require("express");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

app.use(express.json())
app.use(cookieParser())
const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

if (configuredOrigins?.includes("*")) {
    throw new Error("CORS_ORIGIN must contain explicit origins when credentials are enabled.")
}

const allowedOrigins = new Set([
    ...(configuredOrigins || []),
    "https://r-prep-ai.vercel.app",
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"])
])

app.use(cors({
    origin: [...allowedOrigins],
    credentials: true
}))

app.get("/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1

    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "ok" : "unavailable",
        database: databaseConnected ? "connected" : "disconnected"
    })
})

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" })
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const status = error.statusCode || error.status
        || (error.code === "LIMIT_FILE_SIZE" ? 413 : 500)
    const message = status >= 500 ? "Internal server error" : error.message

    if (status >= 500) {
        console.error("Unhandled request error:", error)
    }

    return res.status(status).json({ message })
})

module.exports = app;
