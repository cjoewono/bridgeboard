import { Link } from "react-router-dom"

const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-6">
                Built for veterans in transition
            </span>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
                Track your path from <span className="text-blue-600">service</span> to career
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-xl">
                BridgeBoard helps you organize job applications, manage contacts, and stay on top of your military-to-civilian transition — all in one place.
            </p>
            <div className="mt-10 flex gap-4">
                <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Get Started Free
                </Link>
                <Link
                    to="/login"
                    className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Login
                </Link>
            </div>
        </div>
    )
}

export default HomePage