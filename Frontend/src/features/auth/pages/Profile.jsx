import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";
import "../profile.scss";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, handleUpdateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      setDisplayName(user.displayName || user.username || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
      setPreviewURL(user.photoURL || "");
    }
  }, [user, loading, navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setProfileMessage("Please select a valid image file.");
        e.target.value = "";
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfileMessage("This image is too large. Please choose an image under 5 MB.");
        e.target.value = "";
        return;
      }

      setProfileMessage("");
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewURL(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewURL(photoURL);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      setProfileMessage("Display name cannot be empty.");
      return;
    }

    setProfileMessage("");
    setSaving(true);
    const result = await handleUpdateProfile({
      displayName: displayName.trim(),
      profileImage: selectedFile,
    });
    setSaving(false);

    if (result.success) {
      // Update local state with new values from server response
      const updatedUser = result.data.user;
      setPhotoURL(updatedUser.photoURL || "");
      setPreviewURL(updatedUser.photoURL || "");
      setSelectedFile(null);
      navigate("/");
      return;
    }

    setProfileMessage(result.message || "Unable to update profile.");
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || user?.username || "");
    setPreviewURL(user?.photoURL || "");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    navigate("/");
  };

  if (loading || !user) return <LoadingScreen message="Loading your profile" />;

  const avatarLetter = displayName?.charAt(0)?.toUpperCase() || "U";

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-heading">
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h2>Update Profile</h2>
          <p>Keep your profile ready for every interview.</p>
        </div>

      {profileMessage && (
        <div
          className="profile-message"
          role="alert"
        >
          {profileMessage}
        </div>
      )}

      {/* Profile Avatar Section */}
      <div
        className="profile-avatar-section"
      >
        <button
          type="button"
          className="profile-avatar"
          aria-label="Change profile photo"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewURL ? (
            <img
              src={previewURL}
              alt="Profile Preview"
              className="profile-avatar-image"
            />
          ) : (
            avatarLetter
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <button
          type="button"
          className="profile-secondary-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Change Photo
        </button>

        {selectedFile && (
          <button
            type="button"
            className="profile-remove-button"
            onClick={handleRemovePhoto}
          >
            Remove Selected
          </button>
        )}
      </div>

      {/* Display Name Field */}
      <div className="profile-field">
        <label htmlFor="display-name">
          Display Name
        </label>
        <input
          className="profile-input"
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      {/* Email Field (Read-only) */}
      <div className="profile-field profile-email-field">
        <label htmlFor="profile-email">
          Email
        </label>
        <input
          className="profile-input"
          id="profile-email"
          type="email"
          value={email}
          readOnly
          disabled
        />
      </div>

      {/* Action Buttons */}
      <div className="profile-actions">
        <button
          type="button"
          className="profile-save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
        <button
          type="button"
          className="profile-cancel-button"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
      </div>
    </main>
  );
};

export default ProfilePage;
