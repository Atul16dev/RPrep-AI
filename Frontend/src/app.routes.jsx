import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ProfilePage from "./features/auth/pages/Profile";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import History from "./features/interview/pages/History";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing/>
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/dashboard",
        element: <Protected> <Home /></Protected>
    },
    {
        path: "/profile",
        element: <Protected> <ProfilePage /></Protected>
    },
    {
        path: "/history",
        element: <Protected> <History /></Protected>
    },
    {
        path:"/interview/:id",
        element: <Protected> <Interview /></Protected>
    }
])