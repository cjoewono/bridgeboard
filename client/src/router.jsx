import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import JobDetailPage from "./pages/JobDetailPage"
import ContactsPage from "./pages/ContactsPage"
import JobSearchPage from "./pages/JobSearchPage"
import NotFoundPage from "./pages/NotFoundPage"
import TranslatorPage from "./pages/TranslatorPage"

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
            { path: "contacts", element: <ContactsPage /> },
            { path: "search", element: <JobSearchPage /> },
            { path: "translator", element: <TranslatorPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
])

export default router