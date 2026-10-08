import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function Footer() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const currentYear = new Date().getFullYear();
  const [isSignOutOpen, setIsSignOutOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const signOutRef = React.useRef(null);

  React.useEffect(() => {
    const handleOutsidePointer = (event) => {
      if (signOutRef.current && !signOutRef.current.contains(event.target)) {
        setIsSignOutOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  const handleAuthAction = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSignOutOpen(true);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await handleLogout();
    setIsSigningOut(false);
    setIsSignOutOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo & Branding */}
        <div className="footer-branding">
          <div className="footer-logo">
            <img className="brand-logo-image" src="/logo.png" alt="RPrep AI logo" />
            <span className="logo-text">RPrep AI</span>
          </div>
          <p className="footer-tagline">AI-powered interview preparation.</p>
        </div>

        {/* Navigation Links */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Explore</h4>
          <ul className="footer-links">
            {navLinks.map((link, index) => (
              <li key={index}>
                <button
                  className="footer-link"
                  onClick={() => handleScroll(link.href.substring(1))}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Actions */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Account</h4>
          <ul className="footer-links">
            <li ref={signOutRef} className="footer-auth-action">
              <button
                className="footer-link"
                onClick={handleAuthAction}
              >
                {user ? "Sign Out" : "Login"}
              </button>
              {isSignOutOpen && (
                <div
                  className="footer-signout-popover"
                  role="dialog"
                  aria-modal="false"
                  aria-labelledby="footer-signout-title"
                >
                  <h2 id="footer-signout-title">Are you sure you want to sign out?</h2>
                  <div className="signout-modal-actions">
                    <button
                      type="button"
                      className="signout-cancel-button"
                      onClick={() => setIsSignOutOpen(false)}
                      disabled={isSigningOut}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="signout-confirm-button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="footer-link"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      {/* Copyright & Attribution */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {currentYear} RPrep AI. All rights reserved.
        </p>
        <p className="footer-attribution">Powered by Gemini</p>
      </div>
    </footer>
  );
}
