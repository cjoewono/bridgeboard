import { useState, useEffect, useRef } from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import axios from "axios"

const isStaticDeploy = import.meta.env.VITE_DEPLOY_TARGET === "pages"

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [user, setUser] = useState(localStorage.getItem("user"))
    const [translatorState, setTranslatorState] = useState({ query: "", selectedBranch: "", result: null })
    const [jobSearchState, setJobSearchState] = useState({ searchTerm: "", location: "", results: [], totalCount: 0, page: 1, lastSearch: { what: "", where: "" } })
    const navigate = useNavigate()
    const interceptorRef = useRef(null)

    const clearSession = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    useEffect(() => {
        // In static deploy, no backend exists — skip the auth interceptor entirely.
        if (isStaticDeploy) return

        interceptorRef.current = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    clearSession()
                    navigate("/login")
                }
                return Promise.reject(error)
            }
        )
        return () => {
            axios.interceptors.response.eject(interceptorRef.current)
        }
    }, [navigate])

    const login = (tokenValue, userEmail) => {
        setToken(tokenValue)
        setUser(userEmail)
        localStorage.setItem("token", tokenValue)
        localStorage.setItem("user", userEmail)
    }

    const logout = async () => {
        try {
            await axios.post("/api/v1/users/logout/", {}, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
        } catch (err) {
            console.error(err)
        }
        clearSession()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-white">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    <Link
                        to="/"
                        className="text-2xl font-black text-slate-900 tracking-tighter hover:text-blue-600 transition-colors"
                    >
                        <span className="text-blue-600">Bridge</span>
                        <span className="text-slate-900">Board</span>
                    </Link>

                    <div className="flex items-center gap-8">
                        {isStaticDeploy ? (
                            <>
                                
                                    href="#demo"
                                    className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                >
                                    Demo
                                </a>
                                
                                    href="#features"
                                    className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                >
                                    Features
                                </a>
                                
                                    href="#stack"
                                    className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                >
                                    Stack
                                </a>
                                
                                    href="https://github.com/cjoewono/bridgeboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    View on GitHub
                                </a>
                            </>
                        ) : token ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
                                    Dashboard
                                </Link>
                                <Link to="/search" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
                                    Search Jobs
                                </Link>
                                <Link to="/translator" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
                                    MOS Translator
                                </Link>
                                <Link to="/contacts" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
                                    Contacts
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                <Outlet context={{ token, user, login, logout, translatorState, setTranslatorState, jobSearchState, setJobSearchState }} />
            </main>
        </div>
    );
}

export default App
