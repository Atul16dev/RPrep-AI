import React, { useEffect, useRef, useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your Resume",
      description: "Upload your resume in PDF format. We analyze your experience, skills and achievements.",
    },
    {
      number: "02",
      icon: FileText,
      title: "Add Job & Self Details",
      description: "Paste the job description and write a self description. We identify key requirements and your strengths.",
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Get AI Interview Report",
      description: "Our AI analyzes everything and generates your personalized interview report designed around your role and experience.",
    },
  ];

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="how-it-works-section" id="how-it-works" ref={sectionRef}>
      <div className="how-it-works-container">
        <h2 className="how-it-works-title">How It Works</h2>
        <p className="how-it-works-subtitle">Stop guessing. Start preparing with AI.</p>

        <div className={`steps-grid ${isVisible ? "is-visible" : ""}`}>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="step-card"
                style={{ "--delay": index }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <IconComponent size={28} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}