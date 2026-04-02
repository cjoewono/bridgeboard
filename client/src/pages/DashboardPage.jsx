import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import axios from "axios"

const DashboardPage = () => {
    const [jobs, setJobs] = useState([])
    const [company, setCompany] = useState("")
    const [title, setTitle] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { token, user } = useOutletContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            navigate("/login")
        } else {
            fetchJobs()
        }
    }, [token, navigate])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            let response = await axios.get("http://127.0.0.1:8000/api/v1/jobs/", {
                headers: { Authorization: `Token ${token}` }
            })
            setJobs(response.data)
        } catch (err) {
            setError("Failed to load jobs.")
        }
        setLoading(false)
    }

    const addJob = async (event) => {
        event.preventDefault()
        try {
            let response = await axios.post("http://127.0.0.1:8000/api/v1/jobs/", {
                company: company,
                title: title
            }, {
                headers: { Authorization: `Token ${token}` }
            })
            setJobs([...jobs, response.data])
            setCompany("")
            setTitle("")
        } catch (err) {
            setError("Failed to add job.")
        }
    }

    const deleteJob = async (jobId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setJobs(jobs.filter(job => job.id !== jobId))
        } catch (err) {
            setError("Failed to delete job.")
        }
    }

    const updateStatus = async (jobId, newStatus) => {
        try {
            let response = await axios.put(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/`, {
                status: newStatus
            }, {
                headers: { Authorization: `Token ${token}` }
            })
            setJobs(jobs.map((job) =>
                job.id === jobId ? response.data : job
            ))
        } catch (err) {
            setError("Failed to update status.")
        }
    }

    const getStatusBadge = (status) => {
    const styles = {
        saved: "bg-gray-100 text-gray-700",
        applied: "bg-blue-100 text-blue-700",
        interviewing: "bg-yellow-100 text-yellow-700",
        offer: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
    }
    return styles[status] || "bg-gray-100 text-gray-700"
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    {user && <p className="text-sm text-gray-500 mt-1">Welcome back, {user}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: "Total", value: jobs.length, color: "text-gray-900" },
                    { label: "Saved", value: jobs.filter(j => j.status === "saved").length, color: "text-gray-600" },
                    { label: "Applied", value: jobs.filter(j => j.status === "applied").length, color: "text-blue-600" },
                    { label: "Interviewing", value: jobs.filter(j => j.status === "interviewing").length, color: "text-yellow-600" },
                    { label: "Offers", value: jobs.filter(j => j.status === "offer").length, color: "text-green-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Add New Application</h2>
                <form onSubmit={addJob} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Job Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border border-gray-300 p-2.5 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Add Job
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
                    <h2 className="text-sm font-semibold text-gray-700">Applications</h2>
                </div>
                {loading ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : jobs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                        No applications yet. Add your first job above.
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="flex justify-between items-center px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                    {job.company.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm">
                                        {job.company}
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.title}</p>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <select
                                    value={job.status}
                                    onChange={(e) => updateStatus(job.id, e.target.value)}
                                    className="border border-gray-300 p-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button
                                    onClick={() => deleteJob(job.id)}
                                    className="text-red-400 hover:text-red-600 text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default DashboardPage