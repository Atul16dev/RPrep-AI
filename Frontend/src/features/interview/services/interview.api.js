import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "")

const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true,
})

/**
 * @description generate new interview report based of user resume, self description and job description
 */

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview", formData)

    return response.data
}
/**@description Retrieves an interview report by its ID */

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/${interviewId}`)
    return response.data
}

/**
 * @description Retrieves all interview reports for the authenticated user
 */

export const getAllInterviewReports = async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get("/api/interview/", {
        params: { page, limit }
    })
    return response.data
}