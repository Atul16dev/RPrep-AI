import axios from "axios"

const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "")

const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true
})

export async function register({username, email, password}){
    const response = await api.post('/api/auth/register',{
        username, email, password
    })

    return response.data
}

export async function verifyRegistrationOtp({ email, otp }) {
  const response = await api.post("/api/auth/verify-registration-otp", {
    email,
    otp,
  });

  return response.data;
}

export async function login({ email, password}){
    const response = await api.post('/api/auth/login',{
        email, password
    })

    return response.data
}

export async function logout(){
    const response = await api.get('/api/auth/logout')

    return response.data
}

export async function updateProfile({ displayName, profileImage }) {
  const formData = new FormData();
  formData.append("displayName", displayName);
  
  if (profileImage) {
    formData.append("profileImage", profileImage);
  }

  const response = await api.put("/api/auth/profile", formData);

  return response.data;
}

export async function getMe(){
    const response = await api.get('/api/auth/get-me')

    return response.data
}

export async function resendRegistrationOtp({ email }) {
    const response = await api.post("/api/auth/resend-registration-otp", {
        email,
    });

    return response.data;
}


export async function forgotPassword({ email }) {
  const response = await api.post("/api/auth/forgot-password", {
    email,
  });

  return response.data;
}

export async function resetPassword({
  email,
  otp,
  newPassword,
  confirmPassword,
}) {
  const response = await api.post("/api/auth/reset-password", {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
  

  return response.data;
}

export async function googleLogin(credential) {
  const response = await api.post("/api/auth/google", {
    credential,
  });

  return response.data;
}