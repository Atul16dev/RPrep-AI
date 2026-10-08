const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller")
const interviewRouter = express.Router()
const upload = require("../middlewares/file.middleware")

/**
 * @route POST /api/interview
 * @description generate new interview report based of user resume, self description and job description
 * @access private
 */
interviewRouter.post("/",authUser,upload.single("resume"),interviewController.generateInterviewReportController)


/**
 * @route GET /api/interview/:interviewId
 * @description get an interview report by ID
 * @access private
 */
interviewRouter.get("/:interviewId", authUser, interviewController.getInterviewReportByIdController)

/**
 * @route GET /api/interview
 * @description get the authenticated user's interview reports
 * @access private
 */

interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)


module.exports = interviewRouter