const {Router} = require('express')

const authController = require("../controllers/auth.controller")
const authMiddleweare = require("../middlewares/auth.middleware")
const { profileImageUpload } = require("../middlewares/file.middleware")

const authRouter = Router();

authRouter.post("/register",authController.registerUserController)

authRouter.post(
  "/verify-registration-otp",
  authController.verifyRegistrationOtpController
);

authRouter.post(
  "/resend-registration-otp",
  authController.resendRegistrationOtpController
);

authRouter.post("/login", authController.loginUserController)


authRouter.post(
  "/forgot-password",
  authController.forgotPasswordController
);

authRouter.post(
  "/reset-password",
  authController.resetPasswordController
);

authRouter.get("/logout", authController.logoutUserController)

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
