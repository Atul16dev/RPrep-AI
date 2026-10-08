import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toggleChecked, setToggleChecked] = useState(false);

  const handleNavClick = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    setToggleChecked(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img className="brand-logo-image" src="/logo.png" alt="RPrep AI logo" />
          <span className="logo-text">RPrep AI</span>
        </div>

        <div className="navbar-menu">
          <button className="nav-link" onClick={() => handleNavClick("features")}>Features</button>
          <button className="nav-link" onClick={() => handleNavClick("how-it-works")}>How It Works</button>
          <button className="nav-link" onClick={() => handleNavClick("faq")}>FAQ</button>
        </div>

        <div className="navbar-actions" style={{ position: "relative" }}>
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("/login")}>Login</button>
              <button className="button primary-button" onClick={() => navigate("/register")}>Get Started</button>
            </>
          )}

        </div>

        <input id="navbar-toggle" type="checkbox" checked={toggleChecked} onChange={(event) => setToggleChecked(event.target.checked)} aria-label="Toggle navigation menu" aria-expanded={toggleChecked} aria-controls="mobile-navigation" />
        <label htmlFor="navbar-toggle" className="hamburger" aria-label="Toggle navigation menu"><div className="top-bun"></div><div className="meat"></div><div className="bottom-bun"></div></label>
        <label htmlFor="navbar-toggle" className="nav-backdrop"></label>
        <div className="nav" id="mobile-navigation">
          <div className="nav-wrapper">
            <nav>
              <a onClick={() => handleNavClick("features")} href="#features">FEATURES</a><br />
              <a onClick={() => handleNavClick("how-it-works")} href="#how-it-works">HOW IT WORKS</a><br />
              <a onClick={() => handleNavClick("faq")} href="#faq">FAQ</a><br />
              {user && (
                <>
                  <a onClick={() => { setToggleChecked(false); navigate("/history"); }} href="/history">HISTORY</a><br />
                  <ProfileMenu mobile onAction={() => setToggleChecked(false)} />
                </>
              )}
              {!user && <><a onClick={() => { setToggleChecked(false); navigate("/login"); }} href="#login">LOGIN</a><br /><a onClick={() => { setToggleChecked(false); navigate("/register"); }} href="#register">GET STARTED</a></>}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
}
