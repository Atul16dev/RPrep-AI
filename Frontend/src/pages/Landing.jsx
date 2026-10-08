import React from "react";
import "../components/landing.scss";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import ReportPreviewSection from "../components/ReportPreviewSection";
import BenefitsSection from "../components/BenefitsSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ReportPreviewSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}