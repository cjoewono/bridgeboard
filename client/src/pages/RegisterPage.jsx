import { useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import axios from "axios"

const RegisterPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const { login } = useOutletContext()
    const navigate = useNavigate()

    const handleSubmit = async(event) => {
        event.preventDefault()
        if (password !== confirmPassword) {
            console.error("Passwords do not match")
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
            console.error(err)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Register</h1>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 max-w-sm">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border p-2 rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Register
                </button>
            </form>
        </div>
    )
}

export default RegisterPage