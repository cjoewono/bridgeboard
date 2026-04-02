import { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import axios from "axios"

const JobSearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [location, setLocation] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const { token } = useOutletContext()
    const navigate = useNavigate()

    const searchJobs = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError("")
        try {
            const appId = import.meta.env.VITE_ADZUNA_APP_ID
            const appKey = import.meta.env.VITE_ADZUNA_APP_KEY
            let response = await axios.get(
                `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${searchTerm}&where=${location}&results_per_page=10`
            )
            setResults(response.data.results)
        } catch (err) {
            setError("Search failed. Please try again.")
        }
        setLoading(false)
    }

    const saveJob = async (job) => {
        try {
            await axios.post("http://127.0.0.1:8000/api/v1/jobs/", {
                company: job.company.display_name,
                title: job.title
            }, {
                headers: { Authorization: `Token ${token}` }
            })
            alert(`Saved: ${job.title} at ${job.company.display_name}`)
        } catch (err) {
            setError("Failed to save job.")
        }
    }

    useEffect(() => {
        if (!token) {
            navigate("/login")
        }
    }, [token, navigate])

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
                <p className="text-sm text-gray-500 mt-1">Search jobs from Adzuna and save to your tracker</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <form onSubmit={searchJobs} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Job title (e.g. Technical Program Manager)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Location (e.g. Seattle)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Search
                    </button>
                </form>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mt-3">
                        {error}
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">
                        {results.length > 0 ? `${results.length} Results` : "Results"}
                    </h2>
                </div>
                {loading ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">Searching...</div>
                ) : results.length === 0 ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                        No results yet. Try a search above.
                    </div>
                ) : (
                    results.map((job) => (
                        <div key={job.id} className="flex justify-between items-start px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">
                                    {job.company.display_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.company.display_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{job.location.display_name}</p>
                                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 max-w-xl">{job.description}</p>
                                    
                                    {/* FIX APPLIED HERE: Restored the opening <a tag */}
                                    <a
                                        href={job.redirect_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                        View on Adzuna →
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={() => saveJob(job)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                            >
                                + Save
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default JobSearchPage