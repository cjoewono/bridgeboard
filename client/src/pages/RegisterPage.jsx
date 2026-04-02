import { useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import axios from "axios"

const RegisterPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useOutletContext()
    const navigate = useNavigate()

    const handleSubmit = async(event) => {
        event.preventDefault()
        setError("")
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/v1/users/create/", {
                email: email,
                password: password
            })
            login(response.data.token, response.data.email)
            navigate("/dashboard")
        } catch(err) {
            setError("An account with that email already exists.")
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-sm text-gray-500 mt-1">Start tracking your transition today</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors mt-1"
                    >
                        Create Account
                    </button>
                </form>
                <p className="text-sm text-center text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage