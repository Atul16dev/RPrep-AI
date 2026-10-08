import axios from 'axios';

// In production, an empty base URL keeps /api requests on the frontend origin.
const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "")

const api = axios.create({
    baseURL: apiBaseURL,
    // Include the HttpOnly session cookie for protected report endpoints.
    withCredentials: true,
})

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview", formData)

    return response.data
}
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/${interviewId}`)
    return response.data
}

export const getAllInterviewReports = async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get("/api/interview/", {
        params: { page, limit }
    })
    return response.data
}