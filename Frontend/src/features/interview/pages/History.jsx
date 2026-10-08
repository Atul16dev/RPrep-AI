import { useEffect } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, History as HistoryIcon, Plus } from "lucide-react";
import { Link } from "react-router";
import { useInterview } from "../hooks/useInterview";
import styles from "../style/history.module.scss";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function queryPreview(query) {
  if (!query) return "No job description saved for this report.";
  return query.replace(/\s+/g, " ").trim();
}

export default function History() {
  const { loading, reports, reportsPagination, historyError, getReports } = useInterview();
  const currentPage = reportsPagination?.page || 1;
  const totalPages = reportsPagination?.totalPages || 1;

  useEffect(() => {
    getReports(1);
  }, [getReports]);

  const changePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    getReports(page);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} to="/dashboard" aria-label="Return to dashboard">
          <img src="/logo.png" alt="RPrep AI logo" />
          <span>RPrep AI</span>
        </Link>
        <div className={styles.topbarActions}>
          <Link className={styles.homeLink} to="/">
            Home
          </Link>
          <Link className={styles.newReport} to="/dashboard">
            <Plus size={17} />
            New Report
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.eyebrow}><HistoryIcon size={15} /> Your reports</span>
            <h1>Report history</h1>
            <p>Open a previous interview plan without generating it again.</p>
          </div>
          {reportsPagination?.total > 0 && <span className={styles.count}>{reportsPagination.total} reports</span>}
        </div>

        {loading && (
          <div className={styles.state} role="status">
            <span className={styles.spinner} />
            Loading your reports...
          </div>
        )}

        {!loading && historyError && (
          <div className={styles.state} role="alert">
            <FileText size={30} />
            <h2>History is unavailable</h2>
            <p>{historyError}</p>
            <button type="button" className={styles.primaryAction} onClick={() => getReports(currentPage)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !historyError && reports.length === 0 && (
          <div className={styles.state}>
            <FileText size={30} />
            <h2>No reports yet</h2>
            <p>Generate your first interview report and it will appear here.</p>
            <Link className={styles.primaryAction} to="/dashboard">
              Create a report <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && !historyError && reports.length > 0 && (
          <>
            <div className={styles.list}>
              {reports.map((report) => (
                <Link className={styles.reportItem} to={`/interview/${report._id}`} state={{ from: "history" }} key={report._id}>
                  <div className={styles.reportIcon}><FileText size={21} /></div>
                  <div className={styles.reportBody}>
                    <div className={styles.reportTitleRow}>
                      <h2>{report.position || "Interview report"}</h2>
                      <span className={styles.score}>{report.matchScore}% match</span>
                    </div>
                    <p className={styles.query}>{queryPreview(report.jobDescription)}</p>
                    <div className={styles.meta}>
                      <span><CalendarDays size={14} /> {formatDate(report.createdAt)}</span>
                      <span><Clock size={14} /> {formatTime(report.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className={styles.arrow} size={19} />
                </Link>
              ))}
            </div>

            {reports.length > 0 && (
              <nav className={styles.pagination} aria-label="Report history pages">
                <button type="button" className={styles.paginationButton} onClick={() => changePage(currentPage - 1)} disabled={loading || currentPage === 1}>
                  <ChevronLeft size={17} />
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button type="button" className={styles.paginationButton} onClick={() => changePage(currentPage + 1)} disabled={loading || currentPage === totalPages}>
                  Next
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
