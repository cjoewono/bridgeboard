import { Link } from "react-router-dom"

const HomePage = () => {
    return(
        <div>
            <h1 className="text-3xl font-bold">Welcome to BridgeBoard</h1>
            <p className="mt-4 text-gray-600">Your military-to-civilian career transition tracker.</p>
            <div className="mt-6 flex gap-4">
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Get Started</Link>
                <Link to="/login" className="border border-blue-600 text-blue-600 px-4 py">Login</Link>
            </div>
        </div>
    )
}

export default HomePage