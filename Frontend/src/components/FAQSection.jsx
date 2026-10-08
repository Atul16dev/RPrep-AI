import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What do I need to generate a report?",
      answer: "You need three things: your resume (PDF format), the job description for the position you're applying for, and a brief self-description highlighting your key strengths and career goals."
    },
    {
      question: "Can I download my report?",
      answer: "Yes! After your report is generated, you can download it as a PDF file to save offline, share with mentors, or keep for your records."
    },
    {
      question: "Can I upload a PDF resume?",
      answer: "Yes, we support PDF resumes. Simply upload your resume file and we'll extract and analyze your information to create a personalized interview report."
    },
    {
      question: "Do I need an account?",
      answer: "Yes, you'll need to create a free account to generate your interview report. This helps us save your reports and provide you with a personalized experience."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! Your data is encrypted and securely stored. We follow industry-standard security practices to protect your personal information and uploaded documents."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section" id="faq">
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                type="button"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`faq-icon ${openIndex === index ? "open" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="faq-answer" id={`faq-answer-${index}`}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}