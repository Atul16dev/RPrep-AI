const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller")
const interviewRouter = express.Router()
const upload = require("../middlewares/file.middleware")

interviewRouter.post("/",authUser,upload.single("resume"),interviewController.generateInterviewReportController)


interviewRouter.get("/:interviewId", authUser, interviewController.getInterviewReportByIdController)

interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)


module.exports = interviewRouter