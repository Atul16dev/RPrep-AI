import React from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function HeroSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerateReport = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const handleSeeHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="hero-section" id="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-kicker">
            <Sparkles size={14} />
            <span>AI POWERED INTERVIEW PREPARATION</span>
          </div>

          <h1 className="hero-title">
            Prepare Smarter.
            <br />
            <span className="hero-accent">Interview Better.</span>
          </h1>

          <p className="hero-description">
            Upload your resume, job description and self description to get a
            personalized AI-powered interview report designed around your role
            and experience.
          </p>

          <div className="hero-buttons">
            <button
              className="button primary-button"
              onClick={handleGenerateReport}
            >
              Generate My Report
            </button>

            <button
              className="button secondary-button"
              onClick={handleSeeHowItWorks}
            >
              See How It Works
            </button>
          </div>
        </div>

        <div className="hero-report-preview">
          <div className="hero-report-label">
            <h2>Your AI Interview Report</h2>
            <p>See what your personalized report looks like.</p>
          </div>

          <img
            src="/assets/ai-interview-report-preview.png"
            alt="AI interview report preview"
          />
        </div>
      </div>
    </div>
  );
}
