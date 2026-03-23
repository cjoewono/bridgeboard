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
            <nav className="bg-blue-600 text-white p-4">
                <div className="flex gap-4">
                    <Link to="/" className="hover:underline">Home</Link>
                    {token ? (
                        <>
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                            <button onClick={logout} className="hover:underline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:underline">Login</Link>
                            <Link to="/register" className="hover:underline">Register</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="p-6">
                <Outlet context={{ token, user, login, logout }} />
            </main>
        </div>
    )
}

export default App