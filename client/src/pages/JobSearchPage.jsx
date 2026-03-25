import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import axios from "axios"

const JobSearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [location, setLocation] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const { token } = useOutletContext()

    const searchJobs = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const appId = import.meta.env.VITE_ADZUNA_APP_ID
            const appKey = import.meta.env.VITE_ADZUNA_APP_KEY
            let response = await axios.get(
                `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${searchTerm}&where=${location}&results_per_page=10`
            )
            setResults(response.data.results)
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    const saveJob = async (job) => {
        try {
            await axios.post("http://127.0.0.1:8000/api/v1/jobs/", {
                company: job.company.display_name,
                title: job.title
            }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            })
            alert(`Saved: ${job.title} at ${job.company.display_name}`)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Job Search</h1>
            <p className="text-gray-600">Search jobs from Adzuna and save to your tracker</p>

            <form onSubmit={searchJobs} className="mt-4 flex gap-2 max-w-lg">
                <input
                    type="text"
                    placeholder="Job title (e.g. Software Engineer)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded flex-1"
                    required
                />
                <input
                    type="text"
                    placeholder="Location (e.g. Seattle)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border p-2 rounded flex-1"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Search
                </button>
            </form>

            <div className="mt-6">
                {loading ? (
                    <p className="text-gray-600">Searching...</p>
                ) : results.length === 0 ? (
                    <p className="text-gray-600">No results yet. Try a search!</p>
                ) : (
                    results.map((job) => (
                        <div key={job.id} className="border p-4 rounded mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold">{job.title}</h2>
                                    <p className="text-gray-600">{job.company.display_name}</p>
                                    <p className="text-sm text-gray-500">{job.location.display_name}</p>
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                                    <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                                        View on Adzuna
                                    </a>
                                </div>
                                <button onClick={() => saveJob(job)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    Save
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default JobSearchPage