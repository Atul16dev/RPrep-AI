import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function CTASection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="cta-section" id="cta">
      <div className="cta-container">
        <h2 className="cta-title">Your next interview starts here.</h2>
        <p className="cta-subtitle">Stop guessing. Start preparing with AI.</p>

        <button className="button primary-button" onClick={handleCTA}>
          Create My Interview Report
        </button>
      </div>
    </div>
  );
}