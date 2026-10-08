# Cloudinary Profile Image Upload Integration

## Overview
This document outlines the implementation of Cloudinary-based profile image uploads for the RPrep AI project. The integration replaces manual URL entry with direct file uploads, leveraging Cloudinary for secure cloud storage.

---

## Architecture Flow

### Frontend → Backend → Cloudinary → MongoDB

```
User selects image file
        ↓
Profile page validates file type & size (5MB limit)
        ↓
File preview shown to user
        ↓
FormData created with displayName + profileImage
        ↓
Axios sends multipart/form-data to /api/auth/profile
        ↓
Backend auth middleware validates JWT token
        ↓
Multer extracts file from request
        ↓
File validation: image types, 5MB limit
        ↓
Cloudinary.uploader.upload_stream processes file
        ↓
Cloudinary returns secure_url
        ↓
MongoDB user document updated with displayName + photoURL
        ↓
Response returns updated user object
        ↓
Frontend auth context updates user state
        ↓
Navbar displays new avatar + displayName instantly
```

---

## Files Modified

### Backend

#### 1. `/Backend/src/config/cloudinary.js` (NEW)
**Purpose:** Cloudinary configuration and initialization
**Key features:**
- Loads environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- Validates required env vars and logs warnings if missing
- Exports configured Cloudinary v2 instance
- Never exposes API_SECRET to frontend

#### 2. `/Backend/src/middlewares/file.middleware.js` (MODIFIED)
**Changes:**
- Added `profileImageUpload` multer instance specifically for profile images
- Increased file size limit to 5MB (vs 3MB for general uploads)
- Added `fileFilter` to validate only image types (JPEG, PNG, WebP)
- Maintains backward compatibility with existing `upload` export

#### 3. `/Backend/src/routes/auth.routes.js` (MODIFIED)
**Changes:**
- Imported `profileImageUpload` from file middleware
- Updated PUT `/profile` route to include `profileImageUpload.single("profileImage")` middleware
- Middleware chain: `authMiddleware → profileImageUpload → updateProfileController`

#### 4. `/Backend/src/controllers/auth.controller.js` (MODIFIED)
**Major changes:**
- Added Cloudinary import
- Created `uploadToCloudinary()` helper function:
  - Accepts file buffer and userId
  - Uses `cloudinary.uploader.upload_stream()` for efficient streaming
  - Folder structure: `rprep-ai/profiles/profile_${userId}`
  - Uses `overwrite: true` to replace old images safely
- Updated `updateProfileController()`:
  - Now accepts file upload via `req.file`
  - Validates displayName is a string
  - Handles cases where only displayName or only image is updated
  - Validates Cloudinary environment variables before upload
  - Uploads to Cloudinary and receives `secure_url`
  - Stores only the URL in MongoDB (not binary data)
  - Returns updated user object with new displayName and photoURL
  - Comprehensive error handling (401, 400, 404, 500)

#### 5. `/Backend/src/models/user.model.js` (NO CHANGES)
- Already has: `displayName`, `photoURL`, `profileUpdatedAt` fields
- No schema modifications needed

#### 6. Backend environment
Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment, using `Backend/.env.example` as the variable-name reference. Keep actual credentials out of source control.

---

### Frontend

#### 1. `/Frontend/src/features/auth/pages/Profile.jsx` (MODIFIED)
**Changes:**
- Replaced manual URL input with file upload UI
- Added `selectedFile` state for pending upload
- Added `previewURL` state for image preview
- Added `fileInputRef` React.useRef for hidden file input
- Implemented `handleFileSelect()`:
  - Validates file type (must be image)
  - Validates file size (max 5MB)
  - Creates base64 preview URL for immediate visual feedback
- Implemented `handleRemovePhoto()`: removes pending selected file
- Implemented `handleCancel()`: reverts form to last saved state
- Updated UI:
  - Large circular avatar (100px) clickable to open file picker
  - "Change Photo" button
  - "Remove Selected" button (shows only if file selected)
  - Display Name field (editable)
  - Email field (read-only)
  - Save Profile and Cancel buttons
  - Form styling matches RPrep AI design system

#### 2. `/Frontend/src/features/auth/services/auth.api.js` (MODIFIED)
**Changes:**
- Updated `updateProfile()` function:
  - Changed from JSON body to FormData
  - Appends `displayName` string field
  - Appends `profileImage` file field (only if selected)
  - Sends to `/api/auth/profile` PUT endpoint
  - Returns response.data

#### 3. `/Frontend/src/features/auth/hooks/useAuth.js` (MODIFIED)
**Changes:**
- Updated `handleUpdateProfile()`:
  - Changed parameters from `{ displayName, photoURL }` to `{ displayName, profileImage }`
  - Calls updated `updateProfile()` API function
  - Updates user state with response data
  - Handles errors gracefully

#### 4. `/Frontend/src/components/Navbar.jsx` (NO CHANGES)
- Already properly configured to display displayName and photoURL
- Reads from auth context via useAuth hook
- Updates immediately when user state changes

---

## Key Design Decisions

### 1. **FormData for multipart/form-data**
- Browser automatically sets correct boundary
- Axios handles Content-Type correctly
- No manual Content-Type header needed

### 2. **Cloudinary Folder Structure**
- Folder: `rprep-ai/profiles`
- Public ID: `profile_${userId}`
- Using `overwrite: true` ensures only one profile image per user
- Prevents accumulation of old images

### 3. **URL Storage Only**
- MongoDB stores `photoURL` as string (Cloudinary secure_url)
- Not storing binary data or image metadata
- Reduces database size significantly
- Allows easy image replacement

### 4. **File Size Limit: 5MB**
- Profile images don't need to be huge
- Reasonable balance between quality and bandwidth
- Frontend validates before upload
- Backend also validates via multer

### 5. **Supported Image Types**
- JPEG/JPG
- PNG
- WebP
Configured in multer fileFilter

### 6. **Error Handling**
- Missing Cloudinary credentials → 500 error
- Invalid file type → 400 error (multer)
- File too large → 413 error (multer)
- Upload failure → 400 error with message
- User not found → 404 error
- Unauthorized → 401 error

### 7. **Authentication Security**
- JWT token required (auth middleware)
- User ID extracted from token (req.user.id)
- Frontend cannot specify which user to update
- All updates are to authenticated user only

---

## Authentication & Authorization

### Who Can Update?
- Only authenticated users (JWT token in cookie)
- Users can only update their own profile
- User ID determined by auth middleware, not frontend

### What Credentials Are Never Exposed?
- `CLOUDINARY_API_SECRET` - only on backend
- JWT_SECRET - only on backend
- Never sent to frontend

### What Is Validated?
- File type (image only)
- File size (≤ 5MB)
- Display name (non-empty string)
- User authentication (JWT token)
- User existence in MongoDB

---

## Database Schema

### User Model (MongoDB)
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  displayName: String (default: ""),
  photoURL: String (Cloudinary secure_url, default: ""),
  profileUpdatedAt: Date (default: null)
}
```

### What's Stored in Cloudinary
- Binary image file
- Metadata (dimensions, format, etc.)
- Public URL (expires never)
- Organization: `/rprep-ai/profiles/profile_${userId}`

---

## Frontend → Backend → MongoDB Flow

### 1. User selects image
```jsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleFileSelect}
/>
```

### 2. Validation & Preview
```javascript
if (!file.type.startsWith("image/")) return;
if (file.size > 5 * 1024 * 1024) return;
// Create preview with FileReader
```

### 3. Form Submission
```javascript
const formData = new FormData();
formData.append("displayName", displayName);
if (profileImage) {
  formData.append("profileImage", profileImage);
}
await api.put("/api/auth/profile", formData);
```

### 4. Backend Processing
```javascript
// File available in req.file (from multer)
// FormData field available in req.body.displayName
const uploadResult = await uploadToCloudinary(
  req.file.buffer,
  req.file.originalname,
  userId
);
const photoURL = uploadResult.secure_url;
```

### 5. Database Update
```javascript
user.displayName = displayName;
user.photoURL = photoURL; // Cloudinary URL
user.profileUpdatedAt = new Date();
await user.save();
```

### 6. Frontend State Update
```javascript
setUser({
  ...user,
  displayName: response.user.displayName,
  photoURL: response.user.photoURL
});
// Navbar updates automatically
```

---

## Firebase Status

### Not Used for Profile Images
- Firestore: Not used
- Firebase Storage: Not used
- Firebase Auth: Not used for profile functionality

### Used Only For
- Google Authentication (backend OAuth via google-auth-library)
- Google Login endpoint (optional, existing)

### No Conflicts
- Profile data lives in MongoDB
- Profile images live in Cloudinary
- Custom JWT auth is primary auth system
- Firebase code remains untouched

---

## Environment Variables Required

Add to `.env` in Backend folder:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**How to get these:**
1. Sign up at https://cloudinary.com
2. Go to Dashboard → Account Settings → API Keys
3. Copy CLOUD_NAME, API_KEY, API_SECRET
4. Add to Backend/.env

---

## Testing Checklist

### Authentication
- [ ] Login works without changes
- [ ] Register works without changes
- [ ] Logout works without changes
- [ ] Google Login not affected
- [ ] JWT token validation unchanged

### Profile Upload
- [ ] Navigate to /profile page
- [ ] Click avatar or "Change Photo" button
- [ ] File picker opens (accept="image/*")
- [ ] Select valid image (JPEG/PNG/WebP)
- [ ] Preview shows immediately
- [ ] Image preview updates avatar display
- [ ] "Remove Selected" button removes preview
- [ ] Can select different image
- [ ] File size > 5MB shows error
- [ ] Non-image file shows error

### Profile Save
- [ ] Click "Save Profile"
- [ ] Display name updates in MongoDB
- [ ] Image uploads to Cloudinary
- [ ] Cloudinary URL stored in MongoDB photoURL
- [ ] Response returns updated user object
- [ ] User state updates in auth context
- [ ] Navbar avatar updates immediately
- [ ] Navbar display name updates immediately
- [ ] Cancel button reverts changes

### Data Persistence
- [ ] Refresh page → profile data loads from backend
- [ ] Navbar shows saved display name
- [ ] Navbar shows saved profile image
- [ ] Switch pages and back → data persists
- [ ] Other users don't see your profile form

### Reports & Analytics
- [ ] Interview reports still work
- [ ] Analytics still work
- [ ] No console errors
- [ ] No backend errors in logs

---

## Commands to Run

```bash
# Backend only (no new packages needed)
cd Backend
# Verify multer and cloudinary are installed
npm list multer cloudinary

# Frontend
cd Frontend
npm run build  # Already done, should succeed

# Optional: Run dev server to test
npm run dev
```

---

## Rollback Instructions

If you need to rollback:

1. **Revert Backend**
   - Restore `/src/controllers/auth.controller.js` (previous version)
   - Remove `/src/config/cloudinary.js`
   - Restore `/src/middlewares/file.middleware.js`
   - Restore `/src/routes/auth.routes.js`

2. **Revert Frontend**
   - Restore `/src/features/auth/pages/Profile.jsx`
   - Restore `/src/features/auth/services/auth.api.js`
   - Restore `/src/features/auth/hooks/useAuth.js`

3. **Database**
   - No migration needed; MongoDB fields unchanged
   - Existing photoURL values remain

---

## Future Enhancements

### Possible (Not Implemented)
1. Image cropping before upload
2. Drag-and-drop file upload
3. Delete profile image endpoint
4. Image size auto-optimization
5. Profile image CDN caching
6. Avatar gallery selection
7. Bulk image optimization

### Not Recommended
1. Firebase Storage (use Cloudinary instead)
2. Local file storage (use Cloudinary)
3. Base64 in MongoDB (performance issue)
4. Duplicate image storage (overwrite=true prevents this)

---

## Support & Debugging

### Common Issues

**"Image upload service is not configured"**
- Solution: Add CLOUDINARY_* vars to .env

**"Failed to upload image to cloud storage"**
- Check Cloudinary credentials are correct
- Verify file is a valid image
- Check network connectivity

**"Display name cannot be empty"**
- Frontend validates this
- Provide non-empty displayName

**File type error "Only JPEG, PNG, and WebP images are allowed"**
- Your file might be .BMP, .GIF, .SVG, etc.
- Convert to PNG/JPEG first

### Debugging

**Frontend errors:**
- Check browser DevTools Console for API errors
- Network tab shows request/response details

**Backend errors:**
- Check terminal logs when running `npm run dev`
- 400-level errors show in response message
- 500-level errors log full stack

---

## Summary

✅ **Completed**
- Cloudinary configuration
- Backend image upload integration
- MongoDB URL storage
- Frontend file selection UI
- FormData handling
- Auth validation
- Error handling
- Build verification

✅ **Unchanged**
- Login/Register/Logout
- Google Auth
- Interview reports
- Analytics
- Existing auth system
- User model (already had fields)

✅ **Environment**
- Added Cloudinary vars to .env
- No credentials in code
- No Firebase Firestore/Storage
- MongoDB remains primary DB
