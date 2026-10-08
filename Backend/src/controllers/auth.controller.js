const userModel = require("../models/user.model")

const { OAuth2Client } = require("google-auth-library");
const cloudinary = require("../config/cloudinary");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const tokenBlacklistModel = require("../models/blacklist.model")
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pendingRegistrationModel = require("../models/pendingRegistration.model");
const passwordResetModel = require("../models/passwordReset.model");

// Helper function to upload to Cloudinary
async function uploadToCloudinary(buffer, userId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rprep-ai/profiles",
        public_id: `profile_${userId}`,
        resource_type: "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
}

async function updateProfileController(req, res) {
  try {
    const { displayName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (typeof displayName !== "string") {
        return res.status(400).json({
          message: "Display name must be a string",
        });
      }

      const trimmedName = displayName.trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Display name cannot be empty",
        });
      }
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let newPhotoURL = user.photoURL;

    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          return res.status(500).json({
            message: "Image upload service is not configured",
          });
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          userId
        );

        newPhotoURL = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(400).json({
          message: "Failed to upload image to cloud storage",
        });
      }
    }

    // Update user document
    if (displayName !== undefined) {
      user.displayName = displayName.trim();
    }

    user.photoURL = newPhotoURL;
    user.profileUpdatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
}



async function sendRegistrationOtp(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"RPrep AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your RPrep AI verification OTP",
    text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <h2>RPrep AI Email Verification</h2>
      <p>Your RPrep AI verification OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  });
}

async function sendPasswordResetOtp(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"RPrep AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "RPrep AI password reset OTP",
    text: `Your RPrep AI password reset OTP is ${otp}. It will expire in 10 minutes.`,
    html: `
      <h2>RPrep AI Password Reset</h2>
      <p>Your password reset OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  });
  
}


async function googleLoginController(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      message: "Google credential is required",
    });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const email = payload?.email?.toLowerCase();

  if (!email || !payload?.email_verified) {
    return res.status(400).json({
      message: "Google email is not verified",
    });
  }

  const username = payload.name || email.split("@")[0];

  let user = await userModel.findOne({ email });

  if (!user) {
    const randomPassword = await bcrypt.hash(
      crypto.randomBytes(32).toString("hex"),
      10
    );

    user = await userModel.create({
      username: `${username}-${crypto.randomInt(1000, 9999)}`,
      email,
      password: randomPassword,
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    message: "Google login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.username,
      photoURL: user.photoURL || "",
    },
  });
}


async function forgotPasswordController(req, res) {
  const normalizedEmail = req.body.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const user = await userModel.findOne({
    email: normalizedEmail,
  });

  // Same response rakha gaya hai, taaki koi email check karke
  // ye discover na kar sake ki account exist karta hai ya nahi.
  if (!user) {
    return res.status(200).json({
      message: "If this email exists, a password reset OTP has been sent",
    });
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await sendPasswordResetOtp(normalizedEmail, otp);

  await passwordResetModel.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      otpHash,
      otpExpiresAt,
      attempts: 0,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return res.status(200).json({
    message: "Password reset OTP sent successfully",
  });
}


async function resetPasswordController(req, res) {
  const {
    email,
    otp,
    newPassword,
    confirmPassword,
  } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Email, OTP and both passwords are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and contain one uppercase and one lowercase letter",
    });
  }

  const resetRequest = await passwordResetModel.findOne({
    email: normalizedEmail,
  });

  if (!resetRequest) {
    return res.status(400).json({
      message: "OTP expired or reset request not found",
    });
  }

  if (resetRequest.otpExpiresAt < new Date()) {
    await passwordResetModel.deleteOne({
      _id: resetRequest._id,
    });

    return res.status(400).json({
      message: "OTP expired. Please request a new OTP",
    });
  }

  if (resetRequest.attempts >= 5) {
    await passwordResetModel.deleteOne({
      _id: resetRequest._id,
    });

    return res.status(429).json({
      message: "Too many incorrect attempts. Please request a new OTP",
    });
  }

  const submittedOtpHash = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  if (submittedOtpHash !== resetRequest.otpHash) {
    resetRequest.attempts += 1;
    await resetRequest.save();

    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  const user = await userModel.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return res.status(400).json({
      message: "Unable to reset password",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await passwordResetModel.deleteOne({
    _id: resetRequest._id,
  });

  return res.status(200).json({
    message: "Password reset successfully",
  });
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password
 * @access Public
 */

async function registerUserController(req, res) {
  const { username, email, password } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();

  if (!username?.trim() || !normalizedEmail || !password) {
    return res.status(400).json({
      message: "Please provide username, email and password",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and contain one uppercase and one lowercase letter."
    });
  }

  const existingUser = await userModel.findOne({
    $or: [{ username: username.trim() }, { email: normalizedEmail }],
  });

  if (existingUser) {
    return res.status(400).json({
      message: "Account already exists with this username or email",
    });
  }

  const existingPendingRegistration =
    await pendingRegistrationModel.findOne({
      email: normalizedEmail,
    });

  if (existingPendingRegistration) {
    return res.status(409).json({
      code: "OTP_ALREADY_SENT",
      message: "OTP already sent. Please verify your email",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const otp = crypto.randomInt(100000, 1000000).toString();

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await sendRegistrationOtp(normalizedEmail, otp);

  await pendingRegistrationModel.create({
    username: username.trim(),
    email: normalizedEmail,
    password: hash,
    otpHash,
    otpExpiresAt,
  });

  return res.status(200).json({
    message: "OTP sent successfully",
    email: normalizedEmail,
  });
}

async function resendRegistrationOtpController(req, res) {
  const normalizedEmail = req.body.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const pendingRegistration = await pendingRegistrationModel.findOne({
    email: normalizedEmail,
  });

  if (!pendingRegistration) {
    return res.status(400).json({
      message: "Registration not found. Please register again",
    });
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  await sendRegistrationOtp(normalizedEmail, otp);

  pendingRegistration.otpHash = otpHash;
  pendingRegistration.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  pendingRegistration.attempts = 0;
  await pendingRegistration.save();

  return res.status(200).json({
    message: "A new OTP has been sent successfully",
  });
}

async function verifyRegistrationOtpController(req, res) {
  const { email, otp } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const pendingRegistration =
    await pendingRegistrationModel.findOne({
      email: normalizedEmail,
    });

  if (!pendingRegistration) {
    return res.status(400).json({
      message: "OTP expired or registration not found",
    });
  }

  if (pendingRegistration.otpExpiresAt < new Date()) {
    await pendingRegistrationModel.deleteOne({
      _id: pendingRegistration._id,
    });

    return res.status(400).json({
      message: "OTP expired. Please register again",
    });
  }

  if (pendingRegistration.attempts >= 5) {
    await pendingRegistrationModel.deleteOne({
      _id: pendingRegistration._id,
    });

    return res.status(429).json({
      message: "Too many incorrect attempts. Please register again",
    });
  }

  const submittedOtpHash = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  if (submittedOtpHash !== pendingRegistration.otpHash) {
    pendingRegistration.attempts += 1;
    await pendingRegistration.save();

    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  const user = await userModel.create({
    username: pendingRegistration.username,
    email: pendingRegistration.email,
    password: pendingRegistration.password,
  });

  await pendingRegistrationModel.deleteOne({
    _id: pendingRegistration._id,
  });

  return res.status(201).json({
    message: "Email verified and account created successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name loginUserController
 * @description login a user, expects username and password in the request body
 * @access Public
 */

async function loginUserController(req, res) {
    const { email, password} = req.body

    const user = await userModel.findOne({ email })

    if(!user){
        return res.status(400).json({
            message: "Invalid email or Password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Invalid Password"
        })
    }

    const token = jwt.sign(
        {id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })

    res.status(201).json({
        message: "User Loggedin successfully",

        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName || user.username,
            photoURL: user.photoURL || ""
        }
    })

}

/**
 * @name logoutUserController
 * @description logout a user, expects token in the request cookie
 * @access Public
 */

async function logoutUserController(req,res) {
    const token = req.cookies.token

    if(token){
        //add in blacklist
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access Private
 */

async function getMeController(req,res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "user details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName || user.username,
            photoURL: user.photoURL || ""
        }
    })

}

module.exports = {
  registerUserController,
  verifyRegistrationOtpController,
  resendRegistrationOtpController,
  forgotPasswordController,
  resetPasswordController,
  loginUserController,
  logoutUserController,
  getMeController,
  googleLoginController,
  updateProfileController,
};