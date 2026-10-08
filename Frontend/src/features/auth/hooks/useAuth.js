import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context";
import {
  login,
  googleLogin,
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
  updateProfile,
} from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleForgotPassword = async ({ email }) => {
        setLoading(true)
        try {
            const data = await forgotPassword({ email })
            return { success: true, data }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Unable to send password reset OTP",
            }
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async ({ displayName, profileImage }) => {
  setLoading(true);

  try {
    const data = await updateProfile({ displayName, profileImage });

    setUser((prev) => ({
      ...prev,
      ...data.user,
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Unable to update profile",
    };
  } finally {
    setLoading(false);
  }
};

    const handleResetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
        setLoading(true)
        try {
            const data = await resetPassword({ email, otp, newPassword, confirmPassword })
            return { success: true, data }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Unable to reset password",
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async ({email, password}) => {
        setLoading(true)
        try {
            const data = await login({email, password})
            setUser(data.user)
            return true
        } catch {
            return false
        }
        finally{
            setLoading(false)
        }
    }

const handleRegister = async ({ username, email, password }) => {
  setLoading(true);

  try {
    const data = await register({ username, email, password });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      code: error.response?.data?.code,
      message:
        error.response?.data?.message ||
        "Unable to start registration",
    };
  } finally {
    setLoading(false);
  }
};

const handleVerifyRegistrationOtp = async ({ email, otp }) => {
  setLoading(true);

  try {
    const data = await verifyRegistrationOtp({ email, otp });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Invalid OTP",
    };
  } finally {
    setLoading(false);
  }
};

const handleResendRegistrationOtp = async ({ email }) => {
  setLoading(true);

  try {
    const data = await resendRegistrationOtp({ email });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Unable to resend OTP",
    };
  } finally {
    setLoading(false);
  }
};

    const handleLogout = async() =>{
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.error("Unable to log out", error)
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(()=>{

        const getAndSetUser = async()=>{
            
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (error) {
              if (error.response?.status !== 401) {
                console.error("Unable to restore the current session", error)
              }
            }
            finally{
                setLoading(false)
            }
        }

        getAndSetUser()
    },[setLoading, setUser])

    const handleGoogleLogin = async (credential) => {
  setLoading(true);

  try {
    const data = await googleLogin(credential);
    setUser(data.user);
    return true;
  } catch {
    return false;
  } finally {
    setLoading(false);
  }
};

    return {
  user,
  loading,
  handleRegister,
  handleVerifyRegistrationOtp,
  handleResendRegistrationOtp,
  handleForgotPassword,
  handleResetPassword,
  handleLogin,
  handleLogout,
  handleGoogleLogin,
  handleUpdateProfile,
};
}