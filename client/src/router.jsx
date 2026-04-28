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

// VITE_DEPLOY_TARGET=pages is set by the GitHub Actions workflow.
// In a static deploy, the backend isn't reachable, so all auth-dependent
// routes are removed and replaced with a NotFound fallback.
const isStaticDeploy = import.meta.env.VITE_DEPLOY_TARGET === "pages"
const basename = isStaticDeploy ? "/bridgeboard" : "/"

const fullRoutes = [
    { index: true, element: <HomePage /> },
    { path: "login", element: <LoginPage /> },
    { path: "register", element: <RegisterPage /> },
    { path: "dashboard", element: <DashboardPage /> },
    { path: "jobs/:jobId", element: <JobDetailPage /> },
    { path: "contacts", element: <ContactsPage /> },
    { path: "search", element: <JobSearchPage /> },
    { path: "translator", element: <TranslatorPage /> },
    { path: "*", element: <NotFoundPage /> },
]

const staticRoutes = [
    { index: true, element: <HomePage /> },
    { path: "*", element: <NotFoundPage /> },
]

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: isStaticDeploy ? staticRoutes : fullRoutes,
    },
], { basename })

export default router
