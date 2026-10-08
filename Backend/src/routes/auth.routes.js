const {Router} = require('express')

const authController = require("../controllers/auth.controller")
const authMiddleweare = require("../middlewares/auth.middleware")
const { profileImageUpload } = require("../middlewares/file.middleware")

const authRouter = Router();

/**
 * @route POST / api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register",authController.registerUserController)

authRouter.post(
  "/verify-registration-otp",
  authController.verifyRegistrationOtpController
);

authRouter.post(
  "/resend-registration-otp",
  authController.resendRegistrationOtpController
);

/**
 * @route POST / api/auth/login
 * @description Login a user with email and password
 * @access Public
 */

authRouter.post("/login", authController.loginUserController)


authRouter.post(
  "/forgot-password",
  authController.forgotPasswordController
);

authRouter.post(
  "/reset-password",
  authController.resetPasswordController
);

/**
 * @route GET / api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */

authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET / api/auth/get-me
 * @description get the current logged in user details
 * @access Private
 */

authRouter.get("/get-me", authMiddleweare.authUser,authController.getMeController)

authRouter.post(
  "/google",
  authController.googleLoginController
);

authRouter.put(
  "/profile",
  authMiddleweare.authUser,
  profileImageUpload.single("profileImage"),
  authController.updateProfileController
);

module.exports = authRouter;

