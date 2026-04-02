import { useState, useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import axios from "axios"

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [user, setUser] = useState(localStorage.getItem("user"))

    const login = (tokenValue, userEmail) => {
        setToken(tokenValue)
        setUser(userEmail)
        localStorage.setItem("token", tokenValue)
        localStorage.setItem("user", userEmail)
    }

    const logout = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/v1/users/logout/", {}, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
        } catch (err) {
            console.error(err)
        }
        setToken(null)
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    return (
    <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
                    BridgeBoard
                </Link>
                <div className="flex items-center gap-6">
                    {token ? (
                        <>
                            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                            <Link to="/search" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Search Jobs</Link>
                            <Link to="/contacts" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Contacts</Link>
                            <button
                                onClick={logout}
                                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
                            <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
            <Outlet context={{ token, user, login, logout }} />
        </main>
    </div>
    )
}

export default App