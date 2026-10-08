import {createContext,useState} from "react"


export const InterviewContext = createContext()

export const InterviewProvider = ({children}) => {
    const [loading, setloading] = useState(false)
    const [report, setreport] = useState(false)
    const [reports, setreports] = useState([])
    const [reportsPagination, setReportsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
    const [historyError, setHistoryError] = useState("")
    return(
        <InterviewContext.Provider value={{ loading, setloading, report,setreport, reports, setreports, reportsPagination, setReportsPagination, historyError, setHistoryError}}>
            {children}
        </InterviewContext.Provider>
    )
}