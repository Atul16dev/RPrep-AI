import React, { useState, useRef } from "react";
import "../style/home.scss";
import {
  BriefcaseBusiness,
  Upload,
  UserRound,
  WandSparkles,
  Sparkles,
  BrainCircuit,
  Target,
  ChartNoAxesCombined,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import {useInterview} from '../hooks/useInterview.js'
import { Link, useNavigate } from "react-router";
import LoadingScreen from "../../../components/LoadingScreen.jsx";

const Home = () => {

  const {loading, generateReport} = useInterview()
  const [jobDescription, setJobfDescription] = useState("")
  const [selfDescription, setselfDescription] = useState("")
  const [error, setError] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const resumeInputRef = useRef()
  const cardRef = useRef(null);

  const navigate = useNavigate()

  const handleResumeChange = (file) => {
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.")
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Your resume must be smaller than 3MB.")
      return
    }

    setError("")
    setResumeFile(file)
  }

  const handleResumeDrop = (event) => {
    event.preventDefault()
    handleResumeChange(event.dataTransfer.files?.[0])
  }

  const removeResume = () => {
    setResumeFile(null)
    if (resumeInputRef.current) resumeInputRef.current.value = ""
  }

  const handleGenerateReport = async () => {
    setError("")
    const missingFields = [];
    
    if (!jobDescription.trim()) {
    missingFields.push("Job Description");
  }

  if (!selfDescription.trim()) {
    missingFields.push("Self Description");
  }

  if (!resumeFile) {
    missingFields.push("Upload Resume");
  }

  if (missingFields.length > 0) {
    setError(`Please fill the following fields: ${missingFields.join(", ")}`);
    return;
  }

    try {
      const data = await generateReport({ jobDescription, selfDescription, resumeFile })
      if (!data?.interviewReport?._id) {
        setError("We could not generate your report. Please try again.")
        return
      }
      navigate(`/interview/${data.interviewReport._id}`, { state: { from: "dashboard" } })
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate the report. Please try again.")
    }
  }

  if(loading){
    return <LoadingScreen />;
  }

  const handleCardMouseMove = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 2;
    const rotateX = ((centerY - y) / centerY) * 2;

    card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
        `;

    const elements = card.querySelectorAll(".parallax-item");

    elements.forEach((element) => {
      const depth = Number(element.dataset.depth) || 0.5;

      const moveX = ((x - centerX) / centerX) * depth * 6;

      const moveY = ((y - centerY) / centerY) * depth * 6;

      element.style.transform = `
                translate3d(${moveX}px, ${moveY}px, 0)
            `;
    });
  };

  const handleCardMouseLeave = () => {
    const card = cardRef.current;

    if (!card) return;

    card.style.transform = `
            perspective(1000px)
            rotateX(0deg)
            rotateY(0deg)
        `;

    const elements = card.querySelectorAll(".parallax-item");

    elements.forEach((element) => {
      element.style.transform = "translate3d(0, 0, 0)";
    });
  };

  return (
    <main className="home">
      <div className="dashboard-brand" aria-label="RPrep AI">
        <img src="/logo.png" alt="RPrep AI logo" />
        <span>RPrep AI</span>
        <Link className="dashboard-home-link" to="/">
          Home
        </Link>
        <Link className="dashboard-home-link" to="/history">
          History
        </Link>
      </div>

      <div className="interview-layout">
        {/* LEFT PART */}

        <div className="dashboard-hero">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>AI-Powered</span>
          </div>

          <h1 className="animated-title">
            <span>Create</span>

            <span>Your</span>
            <br />
            <span>Custom </span>
            <br />
            <span className="gradient-word">Interview Plan</span>
          </h1>

          <div className="gradient-line"></div>

          <p className="hero-description">
            Let our AI analyze the job requirements and your unique profile to
            build a winning strategy.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <BrainCircuit size={22} />
              </div>

              <div>
                <h3>AI-Powered Analysis</h3>
                <p>Smart insights for better preparation</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Target size={22} />
              </div>

              <div>
                <h3>Personalized Plan</h3>
                <p>Tailored to your profile and goals</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ChartNoAxesCombined size={22} />
              </div>

              <div>
                <h3>Better Chances</h3>
                <p>Increase your interview success rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT PART END HERE */}

        {/* RIGHT PART */}

        <div
          className="interview-input-group"
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="left">
           

            <div className="section-heading">
              <div className="icon-box">
                <BriefcaseBusiness size={24} />
              </div>

              <div>
                <h2>Job Description</h2>
                <p>Enter the job details and requirements</p>
              </div>
            </div>

            <textarea
              onChange={(e)=>{setJobfDescription(e.target.value)}}
              name="jobDescription"
              id="jobDescription"
              placeholder="Paste the job description here..."
            ></textarea>
          </div>
          <div className="right">
            <div className="input-group">
              <div className="section-heading">
                <div className="icon-box">
                  <Upload size={24} />
                </div>

                <div>
                  <h2>Upload Resume</h2>
                </div>
              </div>

              <div
                className={`upload-box ${resumeFile ? "has-file" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleResumeDrop}
              >
                {resumeFile ? (
                  <div className="selected-file" aria-live="polite">
                    <div className="selected-file-icon">
                      <FileText size={28} />
                    </div>
                    <div className="selected-file-info">
                      <strong>{resumeFile.name}</strong>
                      <span>{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · PDF</span>
                    </div>
                    <div className="file-actions">
                      <label className="file-action" htmlFor="resume" title="Replace resume">
                        <RefreshCw size={16} />
                        <span>Replace</span>
                      </label>
                      <button type="button" className="file-action remove-file" onClick={removeResume} title="Remove resume">
                        <X size={17} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={38} />
                    <p>Drop your PDF here or choose a file</p>
                    <span>PDF (Max. 3MB)</span>
                    <label className="file-label" htmlFor="resume">
                      Choose File
                    </label>
                  </>
                )}
                <input
                  hidden
                  ref={resumeInputRef}
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf,application/pdf"
                  onChange={(event) => handleResumeChange(event.target.files?.[0])}
                />
              </div>
            </div>

            <div className="input-group self-description">
              <div className="section-heading">
                <div className="icon-box">
                  <UserRound size={24} />
                </div>

                <div>
                  <h2>Self Description</h2>
                </div>
              </div>

              <textarea
                onChange={(e)=>{setselfDescription(e.target.value)}}
                name="selfDescription"
                id="selfDescription"
                placeholder="Tell us about yourself, your skills, and experience..."
              />
            </div>

            {error && (
  <div
    className="error-modal-backdrop"
    role="presentation"
    onClick={() => setError("")}
  >
    <div
      className="error-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="error-modal-close"
        onClick={() => setError("")}
        aria-label="Close error message"
      >
        <X size={20} />
      </button>

      <div className="error-modal-icon">
        <X size={26} />
      </div>

      <h2 id="error-modal-title">Incomplete Form</h2>
      <p>{error}</p>

      <button
        type="button"
        className="error-modal-button"
        onClick={() => setError("")}
      >
        Okay
      </button>
    </div>
  </div>
)}

            <button 
            onClick={handleGenerateReport}
            className="button1 primary-button generate-button">
              <WandSparkles size={20} />
              <span>Generate Interview Report</span>
            </button>
          </div>
        </div>

        {/* RIGHT PART END HERE */}
      </div>
    </main>
  );
};

export default Home;
