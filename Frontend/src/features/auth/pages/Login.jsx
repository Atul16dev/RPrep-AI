import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const {
    loading,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleResetPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (resetMode) {
      const result = await handleResetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setForgotMode(false);
        setResetMode(false);
        setPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.message);
      }

      return;
    }

    if (forgotMode) {
      const result = await handleForgotPassword({ email });

      if (result.success) {
        setResetMode(true);
      } else {
        setError(result.message);
      }

      return;
    }

    const success = await handleLogin({ email, password });

    if (success) {
      navigate("/");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  if (loading) {
    return <LoadingScreen message="Signing you in" />;
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
            {resetMode
              ? "Reset Password"
              : forgotMode
                ? "Forgot Password"
                : "Welcome Back"}
          </h1>

          <p>
            {resetMode
              ? "Enter OTP and create a new password"
              : forgotMode
                ? "Enter your email to receive an OTP"
                : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            {!resetMode && (
              <>
                <label htmlFor="email">Email</label>

                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="off"
                  className="input"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                />
              </>
            )}

            {resetMode ? (
              <>
                <label htmlFor="otp">OTP</label>

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

                <label htmlFor="newPassword">New Password</label>

                <input
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  className="input"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  required
                />

                <label htmlFor="confirmPassword">Confirm Password</label>

                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  className="input"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  required
                />
              </>
            ) : !forgotMode ? (
              <>
                <label htmlFor="password">Password</label>

                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </>
            ) : null}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="login-actions">
            <button className="button primary-button">
              {resetMode ? "Reset Password" : forgotMode ? "Send OTP" : "Login"}
            </button>
            {!forgotMode && !resetMode && (
              <button
                type="button"
                className="forgot-password-button"
                onClick={() => {
                  setError("");
                  setForgotMode(true);
                }}
              >
                Forgot Password?
              </button>
            )}
          </div>
        </form>

        {!forgotMode && !resetMode && (
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
                    setError("Google login failed. Please try again.");
                  }
                }}
                onError={() => {
                  setError("Google login failed. Please try again.");
                }}
              />
            </div>
          </div>
        )}

        <p className="navigate">
          Don't have an account? <Link to={"/register"}>Create Account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
