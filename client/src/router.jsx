import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import JobDetailPage from "./pages/JobDetailPage"
import NotFoundPage from "./pages/NotFoundPage"

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "dashboard", element: <DashboardPage /> },
            { path: "jobs/:jobId", element: <JobDetailPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
])

export default router