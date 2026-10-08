import React from "react";
import { CheckCircle, TrendingUp, Target, Brain, Lightbulb, Download } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: CheckCircle,
      title: "Overall Match Score and Detailed Breakdown",
      description: "See exactly how well you match the job with a comprehensive skills analysis."
    },
    {
      icon: TrendingUp,
      title: "Top Strengths and Key Achievements",
      description: "Understand what makes you stand out and leverage your unique strengths."
    },
    {
      icon: Target,
      title: "Skill Gaps and How to Improve",
      description: "Identify areas for development and get specific guidance to close the gaps."
    },
    {
      icon: Brain,
      title: "Most Likely Interview Questions",
      description: "Prepare for questions tailored to your role, experience level, and skills."
    },
    {
      icon: Lightbulb,
      title: "AI Recommendations & Preparation Plan",
      description: "Get personalized strategies and actionable steps to ace your interview."
    },
    {
      icon: Download,
      title: "Download Your Report as PDF",
      description: "Save and share your comprehensive interview preparation report anytime."
    }
  ];

  return (
    <div className="benefits-section" id="benefits">
      <div className="benefits-container">
        <h2 className="benefits-title">Everything You Need for Better Preparation</h2>
        <p className="benefits-subtitle">Our AI analyzes your inputs and generates insights that help you prepare with confidence.</p>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  <IconComponent size={32} />
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}