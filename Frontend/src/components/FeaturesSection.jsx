import React from "react";
import { FileText, Briefcase, User } from "lucide-react";

export default function FeaturesSection() {

      const features = [
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "We analyze your resume to evaluate your experience, skills and achievements.",
    },
    {
      icon: Briefcase,
      title: "Job Description Analysis",
      description: "We unpack the job description to identify key skills, responsibilities and expectations.",
    },
    {
      icon: User,
      title: "Self Description Analysis",
      description: "We understand your profile and goals to align your strengths with the right opportunities.",
    },
  ];

  
  return (

    <div className="features-section" id="features">
      <div className="features-container">
        <h2 className="features-title">Everything You Need for Better Preparation</h2>
        <p className="features-subtitle">Our AI analyzes your inputs and generates insights that help you prepare with confidence.</p>
        
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <IconComponent size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}