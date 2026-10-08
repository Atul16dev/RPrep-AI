const express = require("express"); // Import the Express framework

const cookieParser = require("cookie-parser")//import middlewear
const cors = require("cors")

const app = express(); // Create an Express application

app.use(express.json())
app.use(cookieParser())//parse cookie in opject bcz express can read only object
const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: configuredOrigins?.length ? configuredOrigins : ["http://localhost:5173"],
    credentials: true
}))

//require all the routes here
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
 
//using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;