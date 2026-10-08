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

// Credentialed browser requests are restricted to configured origins, with localhost as the fallback.
app.use(cors({
    origin: configuredOrigins?.length ? configuredOrigins : ["http://localhost:5173"],
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;