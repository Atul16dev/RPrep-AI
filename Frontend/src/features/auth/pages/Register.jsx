import React from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import LoadingScreen from "../../../components/LoadingScreen";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const {
    loading,
    handleRegister,
    handleVerifyRegistrationOtp,
    handleResendRegistrationOtp,
    handleGoogleLogin,
  } = useAuth();

  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");

  const handleResendOtp = async () => {
    setError("");

    const result = await handleResendRegistrationOtp({ email });

    if (!result.success) {
      setError(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otpMode) {
      const result = await handleVerifyRegistrationOtp({
        email,
        otp,
      });

      if (result.success) {
        navigate("/login");
      } else {
        setError(result.message);
      }

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters and contain one uppercase and one lowercase letter.",
      );
      return;
    }

    const result = await handleRegister({
      username,
      email,
      password,
    });

    if (result.success) {
      setOtpMode(true);
    } else if (result.code === "OTP_ALREADY_SENT") {
      setOtpMode(true);
      setError("OTP was already sent. Enter it below or resend a new OTP.");
    } else {
      setError(result.message);
    }
  };

  if (loading) {
    return <LoadingScreen message="Creating your account" />;
  }

  return (
    <main className="auth-page">
      <div className="auth-brand" onClick={() => navigate("/")} role="button" tabIndex={0} onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate("/");
        }
      }}>
        <img className="brand-logo-image" src="/logo.png" alt="RPrep AI logo" />
        <span className="logo-text">RPrep AI</span>
      </div>

      <div className="form-container">
        <div className="top">
          <h1 className="login">
            {otpMode ? "Verify Your Email" : "Create Account"}
          </h1>

          <p>
            {otpMode
              ? "Enter the OTP sent to your Gmail"
              : "Create your account to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {!otpMode ? (
            <div className="input-group">
              <label htmlFor="username">Name</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="input"
                id="username"
                name="username"
                placeholder="Enter your name"
                required
              />

              <label htmlFor="email">Gmail</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="input"
                id="email"
                name="email"
                placeholder="name@gmail.com"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="input"
                id="password"
                name="password"
                placeholder="Create a strong password"
                required
              />
            </div>
          ) : (
            <div className="input-group">
              <p>
                OTP has been sent to <strong>{email}</strong>
              </p>

              <label htmlFor="otp">Enter OTP</label>
              <input
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                inputMode="numeric"
                maxLength="6"
                className="input"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit OTP"
                required
              />

              <button
                type="button"
                className="resend-otp-button"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </div>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="button primary-button">
            {otpMode ? "Verify OTP" : "Register"}
          </button>
        </form>

        {!otpMode && (
  <div className="google-auth-section">
    <div className="auth-divider" aria-hidden="true">
      <span>or</span>
    </div>

    <div className="google-login">
      <GoogleLogin
        text="continue_with"
        theme="filled_black"
        shape="rectangular"
        size="large"
        width="100%"
        onSuccess={async (response) => {
          setError("");

          const success = await handleGoogleLogin(response.credential);

          if (success) {
            navigate("/");
          } else {
            setError("Google registration failed. Please try again.");
          }
        }}
        onError={() => {
          setError("Google registration failed. Please try again.");
        }}
      />
    </div>
  </div>
)}

        <p className="navigate">
          Already have an account? <Link to={"/login"}>Login</Link>{" "}
        </p>
      </div>
    </main>
  );
};

export default Register;
