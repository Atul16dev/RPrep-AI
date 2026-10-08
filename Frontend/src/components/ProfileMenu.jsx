import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/hooks/useAuth";
import { History } from "lucide-react";

export default function ProfileMenu({ mobile = false, onAction }) {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileMenuRef = useRef(null);
  const signOutModalRef = useRef(null);
  const displayName = user?.displayName || user?.username || "User";
  const avatarText = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleOutsidePointer = (event) => {
      if (signOutModalRef.current && !signOutModalRef.current.contains(event.target)) {
        setIsSignOutModalOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  if (!user) return null;

  const closeProfile = () => {
    setIsProfileOpen(false);
    onAction?.();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await handleLogout();
    setIsSigningOut(false);
    setIsSignOutModalOpen(false);
    setIsProfileOpen(false);
    onAction?.();
    navigate("/");
  };

  return (
    <div ref={profileMenuRef} className={`profile-menu ${mobile ? "mobile-profile-menu" : ""}`}>
      <button
        type="button"
        className="profile-trigger"
        aria-expanded={isProfileOpen}
        aria-haspopup="menu"
        onClick={() => setIsProfileOpen((previous) => !previous)}
      >
        <div className="profile-trigger-avatar">
          {user.photoURL ? <img src={user.photoURL} alt={displayName} /> : avatarText}
        </div>
        <span>{displayName}</span>
      </button>

      {isProfileOpen && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {user.photoURL ? <img src={user.photoURL} alt={displayName} /> : avatarText}
            </div>
            <div className="profile-dropdown-identity">
              <span className="profile-dropdown-name">{displayName}</span>
              <span className="profile-dropdown-email">{user.email || ""}</span>
            </div>
          </div>
          <button type="button" className="profile-dropdown-action" onClick={() => { closeProfile(); navigate("/profile"); }}>
            Update Profile
          </button>
          <button type="button" className="profile-dropdown-action" onClick={() => { closeProfile(); navigate("/history"); }}>
            <History size={16} />
            Report History
          </button>
          <button type="button" className="profile-dropdown-action profile-signout-action" onClick={() => { setIsProfileOpen(false); setIsSignOutModalOpen(true); }}>
            Sign Out
          </button>
        </div>
      )}

      {isSignOutModalOpen && (
        <div ref={signOutModalRef} className="signout-modal-backdrop" role="presentation">
          <div className="signout-modal" role="dialog" aria-modal="true" aria-labelledby="signout-modal-title">
            <h2 id="signout-modal-title">Are you sure you want to sign out?</h2>
            <div className="signout-modal-actions">
              <button type="button" className="signout-cancel-button" onClick={() => setIsSignOutModalOpen(false)} disabled={isSigningOut}>
                Cancel
              </button>
              <button type="button" className="signout-confirm-button" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
