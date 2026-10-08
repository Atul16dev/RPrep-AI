import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import styles from "../style/interview.module.scss";
import LoadingScreen from "../../../components/LoadingScreen";
import { getInterviewReportById } from "../services/interview.api";
import {
  ArrowLeft,
  Download,
  Briefcase,
  CalendarDays,
  Clock,
  Hash,
  Bot,
  Code2,
  Users,
  Target,
  BookOpen,
  Cloud,
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Sun,
  Moon,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------
 * Generated report page
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */
function scoreBand(score) {
  if (score >= 80) return "good";
  if (score >= 60) return "mid";
  return "low";
}

const MATCH_LABEL = { good: "Strong Match", mid: "Good Match", low: "Needs Review" };
const SEVERITY_TO_BAND = { low: "good", medium: "mid", high: "low" };
// Severity as filled segments out of 3 — gives the same "how bad is it"
// read as the reference's mini progress bar, driven by real data
// instead of a fabricated percentage.
const SEVERITY_TO_SEGMENTS = { low: 1, medium: 2, high: 3 };

// Your schema only stores `skill` + `severity`, not a description.
// This turns severity into one honest, generic sentence rather than
// inventing specifics the AI never actually said.
function gapHint(severity) {
  if (severity === "high") return "Priority area — address this before your next round.";
  if (severity === "medium") return "Worth focused practice ahead of your next interview.";
  return "Minor gap — a quick refresher should close it.";
}

// Picks an icon for a prep-plan day based on keywords in its focus
// text, so the timeline doesn't need per-day icon data in the DB.
function focusIcon(focus) {
  const f = focus.toLowerCase();
  if (f.includes("cloud") || f.includes("deploy")) return Cloud;
  if (f.includes("database") || f.includes("sql") || f.includes("query")) return Database;
  return BookOpen;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------
 * ScoreDial — gradient ring (blue → green → purple), matching the
 * reference's signature score card.
 * ------------------------------------------------------------------ */
function ScoreDial({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const band = scoreBand(score);

  return (
    <div className={styles.dial}>
      <svg viewBox="0 0 140 140" className={styles.dialSvg}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b8def" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} className={styles.dialTrack} fill="none" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke="url(#scoreGradient)"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className={styles.dialLabel}>
        <span className={styles.dialScore}>{score}</span>
        <span className={styles.dialMax}>/100</span>
      </div>
      <span className={`${styles.matchBadge} ${styles[band]}`}>
        <Sparkles size={12} />
        {MATCH_LABEL[band]}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------
 * QuestionCard — numbered Q&A block used in both technical and
 * behavioral columns.
 * ------------------------------------------------------------------ */
function QuestionCard({ index, data, type }) {
  return (
    <div className={styles.qCard}>
      <div className={styles.qCardHead}>
        <span className={styles.qNum}>{String(index + 1).padStart(2, "0")}</span>
        <p className={styles.qText}>{data.question}</p>
      </div>
      <div className={styles.qMeta}>
        {type === "technical" && data.topic && <span className={styles.topicTag}>{data.topic}</span>}
        {type === "technical" && data.difficulty && (
          <span className={`${styles.difficultyTag} ${styles[data.difficulty]}`}>
            {data.difficulty[0].toUpperCase() + data.difficulty.slice(1)}
          </span>
        )}
        {type === "behavioral" && data.category && <span className={styles.topicTag}>{data.category}</span>}
      </div>
      {data.reason && <p className={styles.qReason}>{data.reason}</p>}
      <p className={styles.qLabel}>
        <span className={styles.qLabelKey}>What was evaluated: </span>
        {data.intention}
      </p>
      <p className={styles.qLabel}>
        <span className={styles.qLabelKeyGood}>Candidate's answer:</span>
      </p>
      <p className={styles.qAnswer}>{data.answer}</p>
    </div>
  );
}

function AccordionSection({ id, title, icon, iconClass, isOpen, onToggle, children }) {
  const Icon = icon;
  const panelId = `${id}-content`;

  return (
    <section className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
      <button
        type="button"
        className={styles.panelHead}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className={`${styles.iconChip} ${styles[iconClass]}`}>
          <Icon size={16} />
        </span>
        <span className={styles.panelTitle}>{title}</span>
        {isOpen ? <ChevronUp size={18} className={styles.panelChevron} /> : <ChevronDown size={18} className={styles.panelChevron} />}
      </button>
      <div id={panelId} className={styles.panelContent} aria-hidden={!isOpen}>
        <div className={styles.panelContentInner}>{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
 * InterviewReport — top level page
 * ------------------------------------------------------------------ */
export default function InterviewReport() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  function toggleSection(section) {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  }

  function handleBack() {
    const fallbackPath = location.state?.from === "history" ? "/history" : "/dashboard";
    navigate(fallbackPath);
  }


  function downloadReport(style) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const isDark = style === "dark";
  const colors = isDark
    ? {
        background: [15, 23, 42],
        text: [226, 232, 240],
        brand: [56, 189, 248],
        tableFill: [30, 41, 59],
        head: [14, 116, 144],
        headText: [255, 255, 255],
        line: [71, 85, 105],
      }
    : {
        background: [255, 255, 255],
        text: [0, 0, 0],
        brand: [25, 45, 70],
        tableFill: [255, 255, 255],
        head: [25, 45, 70],
        headText: [255, 255, 255],
        line: [200, 200, 200],
      };

  pdf.setFillColor(...colors.background);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...colors.brand);
  pdf.text("RPrep AI", 14, 14);

  pdf.setFontSize(20);
  pdf.setTextColor(...colors.text);
  pdf.text("AI Interview Report", 14, 28);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...colors.text);
  pdf.text(`Candidate: ${report.candidateName}`, 14, 40);
  pdf.text(`Position: ${report.position}`, 14, 48);
  pdf.text(`Match Score: ${report.matchScore}%`, 14, 56);
  pdf.text(`Date: ${formatDate(report.createdAt)}`, 14, 64);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...colors.text);
  pdf.text("Interviewer Feedback", 14, 78);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  const feedbackLines = pdf.splitTextToSize(
    report.interviewerFeedback || "No feedback available",
    pageWidth - 28,
  );

  pdf.text(feedbackLines, 14, 86);

  let currentY = 98 + feedbackLines.length * 5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...colors.text);
  pdf.text("Technical Questions", 14, currentY);

  const pagesBeforeTechnical = pdf.getNumberOfPages();
  autoTable(pdf, {
    startY: currentY + 6,
    head: [["Question", "Topic", "Difficulty", "Answer"]],
    body: (report.technicalQuestions || []).map((item) => [
      item.question,
      item.topic,
      item.difficulty,
      item.answer,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 4,
      font: "helvetica",
      overflow: "linebreak",
      textColor: colors.text,
      fillColor: colors.tableFill,
      lineColor: colors.line,
      lineWidth: 0.2,
    },
    bodyStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    alternateRowStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    headStyles: {
      fillColor: colors.head,
      textColor: colors.headText,
      fontStyle: "bold",
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 28 },
      2: { cellWidth: 24 },
      3: { cellWidth: "auto" },
    },
    willDrawPage: ({ doc }) => {
      if (doc.internal.getCurrentPageInfo().pageNumber > pagesBeforeTechnical) {
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
      }
    },
  });

  currentY = pdf.lastAutoTable.finalY + 15;

  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Behavioral Questions", 14, currentY);

  const pagesBeforeBehavioral = pdf.getNumberOfPages();
  autoTable(pdf, {
    startY: currentY + 6,
    head: [["Question", "Category", "Answer"]],
    body: (report.behavioralQuestions || []).map((item) => [
      item.question,
      item.category,
      item.answer,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 4,
      font: "helvetica",
      overflow: "linebreak",
      textColor: colors.text,
      fillColor: colors.tableFill,
      lineColor: colors.line,
      lineWidth: 0.2,
    },
    bodyStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    alternateRowStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    headStyles: {
      fillColor: colors.head,
      textColor: colors.headText,
      fontStyle: "bold",
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: "auto" },
    },
    willDrawPage: ({ doc }) => {
      if (doc.internal.getCurrentPageInfo().pageNumber > pagesBeforeBehavioral) {
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
      }
    },
  });

  currentY = pdf.lastAutoTable.finalY + 15;

  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Skill Gaps", 14, currentY);

  const pagesBeforeSkillGaps = pdf.getNumberOfPages();
  autoTable(pdf, {
    startY: currentY + 6,
    head: [["Skill", "Severity"]],
    body: (report.skillGaps || []).map((item) => [
      item.skill,
      item.severity,
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 4,
      font: "helvetica",
      overflow: "linebreak",
      textColor: colors.text,
      fillColor: colors.tableFill,
      lineColor: colors.line,
      lineWidth: 0.2,
    },
    bodyStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    alternateRowStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    headStyles: {
      fillColor: colors.head,
      textColor: colors.headText,
      fontStyle: "bold",
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 125 },
      1: { cellWidth: "auto" },
    },
    willDrawPage: ({ doc }) => {
      if (doc.internal.getCurrentPageInfo().pageNumber > pagesBeforeSkillGaps) {
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
      }
    },
  });

  currentY = pdf.lastAutoTable.finalY + 15;

  pdf.setTextColor(...colors.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Preparation Plan", 14, currentY);

  const pagesBeforePreparation = pdf.getNumberOfPages();
  autoTable(pdf, {
    startY: currentY + 6,
    head: [["Phase", "Focus", "Tasks"]],
    body: (report.preparationPlan || []).map((item) => [
      `Phase ${item.day}`,
      item.focus,
      item.tasks.join(", "),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 4,
      font: "helvetica",
      overflow: "linebreak",
      textColor: colors.text,
      fillColor: colors.tableFill,
      lineColor: colors.line,
      lineWidth: 0.2,
    },
    bodyStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    alternateRowStyles: {
      textColor: colors.text,
      fillColor: colors.tableFill,
    },
    headStyles: {
      fillColor: colors.head,
      textColor: colors.headText,
      fontStyle: "bold",
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 43 },
      2: { cellWidth: "auto" },
    },
    willDrawPage: ({ doc }) => {
      if (doc.internal.getCurrentPageInfo().pageNumber > pagesBeforePreparation) {
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
      }
    },
  });

  const safeName = report.candidateName
    ?.replace(/[^a-z0-9]/gi, "-")
    .toLowerCase() || "candidate";

  pdf.save(`${safeName}-interview-report-${style}.pdf`);
  setDownloadModalOpen(false);
}

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      try {
        const data = await getInterviewReportById(id);
        if (!cancelled) setReport(data.interviewReport);
      } catch (error) {
        console.error("Unable to load interview report:", error);
        if (!cancelled) setReport(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <LoadingScreen message="Preparing your interview report" />;
  if (!report) return <div className={styles.state}>No report found for this interview.</div>;

  const technicalQuestions = Array.isArray(report.technicalQuestions) ? report.technicalQuestions : [];
  const behavioralQuestions = Array.isArray(report.behavioralQuestions) ? report.behavioralQuestions : [];
  const skillGaps = Array.isArray(report.skillGaps) ? report.skillGaps : [];
  const preparationPlan = Array.isArray(report.preparationPlan) ? report.preparationPlan : [];

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.reportBrand}>
          <img src="/logo.png" alt="RPrep AI logo" />
          <span>RPrep AI</span>
        </div>

        <div className={styles.topbarActions}>
          <button type="button" className={styles.backBtn} onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            type="button"
            className={styles.downloadBtn}
            onClick={() => setDownloadModalOpen(true)}
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </header>

      {downloadModalOpen && (
        <div className={styles.downloadOverlay} role="presentation">
          <section
            className={styles.downloadModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-report-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setDownloadModalOpen(false)}
              aria-label="Close download options"
            >
              <X size={18} />
            </button>
            <span className={styles.modalEyebrow}>Download Report</span>
            <h2 id="download-report-title">Choose your report style</h2>
            <div className={styles.reportStyleGrid}>
              <button
                type="button"
                className={`${styles.reportStyleCard} ${styles.lightStyle}`}
                onClick={() => downloadReport("light")}
              >
                <Sun size={24} />
                <strong>Light PDF</strong>
                <span>White background</span>
              </button>
              <button
                type="button"
                className={`${styles.reportStyleCard} ${styles.darkStyle}`}
                onClick={() => downloadReport("dark")}
              >
                <Moon size={24} />
                <strong>Dark PDF</strong>
                <span>Dark background</span>
              </button>
            </div>
            <button
              type="button"
              className={styles.modalCancel}
              onClick={() => setDownloadModalOpen(false)}
            >
              Cancel
            </button>
          </section>
        </div>
      )}

      {/* ---- Hero: candidate info + score ---- */}
      <section className={styles.hero}>
        <div className={styles.heroInfo}>
          <span className={styles.eyebrow}>AI Interview Report</span>
          <h1 className={styles.candidateName}>{report.candidateName}</h1>
          <p className={styles.positionLine}>
            <Briefcase size={14} />
            {report.position}
          </p>
          <div className={styles.metaRow}>
            <span>
              <CalendarDays size={13} />
              {formatDate(report.createdAt)}
            </span>
            <span className={styles.metaDot}>|</span>
            <span>
              <Clock size={13} />
              {formatTime(report.createdAt)}
            </span>
            <span className={styles.metaDot}>|</span>
            <span>
              <Hash size={13} />
              Report ID: {report._id}
            </span>
          </div>
        </div>

        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>Overall Match Score</span>
          <ScoreDial score={report.matchScore} />
        </div>
      </section>

      {/* ---- AI feedback ---- */}
      <section className={styles.feedbackPanel}>
        <div className={styles.botIcon}>
          <Bot size={20} />
        </div>
        <div className={styles.feedbackBody}>
          <h2 className={styles.feedbackTitle}>AI Interviewer Feedback</h2>
          <p className={styles.feedbackText}>{report.interviewerFeedback}</p>
        </div>
      </section>

      {/* ---- Technical / Behavioral questions ---- */}
      <div className={styles.sectionStack}>
        <AccordionSection
          id="technical-questions"
          title="Technical Questions"
          icon={Code2}
          iconClass="chipBlue"
          isOpen={openSections.technical}
          onToggle={() => toggleSection("technical")}
        >
          <div className={styles.qStack}>
            {technicalQuestions.map((q, i) => (
              <QuestionCard key={q.question} index={i} data={q} type="technical" />
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          id="behavioral-questions"
          title="Behavioral Questions"
          icon={Users}
          iconClass="chipPurple"
          isOpen={openSections.behavioral}
          onToggle={() => toggleSection("behavioral")}
        >
          <div className={styles.qStack}>
            {behavioralQuestions.map((q, i) => (
              <QuestionCard key={q.question} index={i} data={q} type="behavioral" />
            ))}
          </div>
        </AccordionSection>
      </div>

      {/* ---- Skill gaps / Preparation plan ---- */}
      <div className={styles.sectionStack}>
        <AccordionSection
          id="skill-gaps"
          title="Skill Gaps"
          icon={Target}
          iconClass="chipPink"
          isOpen={openSections.skills}
          onToggle={() => toggleSection("skills")}
        >
          <ul className={styles.gapList}>
            {skillGaps.map((g) => {
              const band = SEVERITY_TO_BAND[g.severity];
              const filled = SEVERITY_TO_SEGMENTS[g.severity];
              return (
                <li key={g.skill} className={styles.gapItem}>
                  <span className={`${styles.gapIcon} ${styles[band]}`}>
                    <Target size={15} />
                  </span>
                  <div className={styles.gapBody}>
                    <div className={styles.gapHead}>
                      <span className={styles.gapSkill}>{g.skill}</span>
                      <span className={`${styles.severityTag} ${styles[band]}`}>
                        {g.severity[0].toUpperCase() + g.severity.slice(1)}
                      </span>
                    </div>
                    <p className={styles.gapDesc}>{gapHint(g.severity)}</p>
                    <div className={styles.segmentBar}>
                      {[1, 2, 3].map((seg) => (
                        <span
                          key={seg}
                          className={`${styles.segment} ${seg <= filled ? styles[band] : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className={styles.gapFooter}>
            Focus on improving these areas to strengthen your profile and increase match score.
          </p>
        </AccordionSection>

        <AccordionSection
          id="roadmap"
          title="Roadmap"
          icon={BookOpen}
          iconClass="chipBlue"
          isOpen={openSections.roadmap}
          onToggle={() => toggleSection("roadmap")}
        >
          <ol className={styles.planList}>
            {preparationPlan.map((p, i) => {
              const Icon = focusIcon(p.focus);
              const isLast = i === preparationPlan.length - 1;
              return (
                <li key={p.day} className={styles.planDay}>
                  <div className={styles.planTimeline}>
                      <span className={styles.planDayCircle}>Phase {p.day}</span>
                    {!isLast && <span className={styles.planLine} />}
                  </div>
                  <div className={styles.planCard}>
                    <div className={styles.planCardHead}>
                      <span className={styles.planFocus}>{p.focus}</span>
                      <Icon size={26} className={styles.planIcon} />
                    </div>
                    <ul className={styles.planTasks}>
                      {p.tasks.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </AccordionSection>
      </div>

      <footer className={styles.disclaimer}>
        <Info size={14} />
        This report is AI-generated and based on the interview responses provided.
      </footer>
    </div>
  );
}