import { useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import axios from "axios"

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useOutletContext()
    const navigate = useNavigate()

    const handleSubmit = async(event) => {
        event.preventDefault()
        setError("")
        try {
            let response = await axios.post("/api/v1/users/login/", {
                email: email,
                password: password
            })
            login(response.data.token, response.data.email)
            navigate("/dashboard")
        } catch(err) {
            setError("Invalid email or password.")
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 px-6 py-12">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 w-full max-w-sm">
                <div className="mb-8 text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-md mb-4">
                        Welcome back
                    </span>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to <span className="text-blue-600">Bridge</span>Board</h1>
                    <p className="text-sm text-slate-500 mt-1">Track your transition. Stay mission-ready.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95 mt-1"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-sm text-center text-slate-500 mt-6">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:underline font-bold">
                        Get started
                    </a>
                </p>
            </div>
        </div>
    )
}

export default LoginPage