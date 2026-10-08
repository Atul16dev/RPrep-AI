import React from "react";
import { FileText, Target, TrendingUp, ChevronRight } from "lucide-react";

export default function ReportPreviewSection() {
  const reportSteps = [
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "Your experience, skills & achievements evaluated"
    },
    {
      icon: Target,
      title: "Job Match",
      description: "Key skills & requirements identified"
    },
    {
      icon: TrendingUp,
      title: "Interview Report",
      description: "Personalized preparation insights & recommendations"
    }
  ];

const reportStats = [
  { label: "Match Score", description: "Profile & Job" },
  { label: "Technical Questions", description: "AI-Generated" },
  { label: "Behavioral Questions", description: "AI-Generated" },
  { label: "Skill Gaps", description: "Identified" },
  { label: "Interviewer Feedback", description: "AI-Generated" },
  { label: "Preparation Plan", description: "Personalized" }
];

  return (
    <div className="report-preview-section" id="report-preview">
      <div className="report-preview-container">
        <h2 className="report-preview-title">Your Personalized Interview Report</h2>
        <p className="report-preview-subtitle">
          Get actionable insights to know where you stand and how you can improve.
        </p>

        <div className="report-flow">
          {reportSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="report-flow-item">
                <div className="report-step-card">
                  <div className="report-step-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="report-step-title">{step.title}</h3>
                  <p className="report-step-description">{step.description}</p>
                </div>
                {index < reportSteps.length - 1 && (
                  <div className="flow-arrow">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="report-stats-grid">
          {reportStats.map((stat, index) => (
  <div key={index} className="report-stat-box">
    <div className="report-stat-number">{stat.label}</div>
    <div className="report-stat-label">{stat.description}</div>
  </div>
))}
        </div>
      </div>
    </div>
  );
}