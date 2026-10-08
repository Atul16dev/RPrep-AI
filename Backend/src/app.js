const express = require("express");

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

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;