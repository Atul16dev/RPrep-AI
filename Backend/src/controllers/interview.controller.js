const pdfParse = require("pdf-parse")
const mongoose = require("mongoose")
const path = require("path")
const { pathToFileURL } = require("url")
const {generateInterviewReport} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

const standardFontDataUrl = pathToFileURL(
    path.join(__dirname, "../../node_modules/pdfjs-dist/standard_fonts/")
).href

async function generateInterviewReportController(req,res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "A PDF resume is required" })
        }

        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "Only PDF resumes are supported" })
        }

        // Parse the uploaded PDF directly from memory; only its extracted text is stored with the report.
        const resumeContent = await (new pdfParse.PDFParse({
            data: Uint8Array.from(req.file.buffer),
            standardFontDataUrl
        })).getText()
        const { selfDescription, jobDescription } = req.body

        if (!selfDescription?.trim() || !jobDescription?.trim()) {
            return res.status(400).json({ message: "Job description and self description are required" })
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (error) {
        const cause = error.cause?.message || error.message
        console.error("Interview report generation failed:", cause)
        res.status(error.code === "GEMINI_REQUEST_FAILED" ? 502 : 503).json({
            message: error.code === "GEMINI_REQUEST_FAILED"
                ? "Gemini could not generate the report. Check your API key and network connection, then try again."
                : "Report generation is temporarily unavailable. Check the database and uploaded PDF, then try again."
        })
    }
}

async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        return res.status(400).json({ message: "Invalid interview report ID" })
    }

    try {
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        }).lean()

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" })
        }

        res.status(200).json({ interviewReport })
    } catch (error) {
        console.error("Interview report lookup failed:", error.message)
        res.status(503).json({ message: "Interview report is temporarily unavailable" })
    }
}

async function getAllInterviewReportsController(req,res){
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 50)
    const skip = (page - 1) * limit

    try {
        const filter = { user: req.user.id }
        const [interviewReports, total] = await Promise.all([
            interviewReportModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("candidateName position matchScore jobDescription createdAt"),
            interviewReportModel.countDocuments(filter)
        ])

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Interview report history lookup failed:", error.message)
        res.status(503).json({ message: "Interview report history is temporarily unavailable" })
    }
}


module.exports = {generateInterviewReportController, getInterviewReportByIdController,getAllInterviewReportsController}