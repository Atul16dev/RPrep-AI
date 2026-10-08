import { getAllInterviewReports, generateInterviewReport,getInterviewReportById } from "../services/interview.api"; 
import { useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context";

export const useInterview = () =>{
    const context = useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used within an interviewProvider")
    }

    const { loading, setloading, report,setreport, reports, setreports, reportsPagination, setReportsPagination, historyError, setHistoryError} = context
    const setLoading = setloading

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) =>{
        setloading(true);
        let response = null
        try{
            response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setreport(response.interviewReport)
        }
        finally{
            setLoading(false)
        }

        return response
    }

    const getReportById = async(interviewid) => {
        setLoading(true);
        let response = null
        try {
            response = await getInterviewReportById(interviewid)
            setreport(response.interviewReport)
        }
        finally{
            setLoading(false)
        }

        return response?.interviewReport ?? null
    }

    const getReports = useCallback(async (page = 1) =>{
        setLoading(true);
        setHistoryError("")
        let response = null
        try{
            response = await getAllInterviewReports({ page })
            setreports(response.interviewReports)
            setReportsPagination(response.pagination)
        }
        catch(error){
            setHistoryError(error.response?.data?.message || "Unable to load your report history.")
        }
        finally{
            setLoading(false)
        }
        return response?.interviewReports ?? []
    }, [setHistoryError, setLoading, setReportsPagination, setreports])

    return {loading, report, reports, reportsPagination, historyError, generateReport, getReportById, getReports}
}