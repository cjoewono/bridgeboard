import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import axios from "axios"

const DashboardPage = () => {
    const [jobs, setJobs] = useState([])
    const [company, setCompany] = useState("")
    const [title, setTitle] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
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
            let response = await axios.get("/api/v1/jobs/", {
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
            let response = await axios.post("/api/v1/jobs/", {
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
            await axios.delete(`/api/v1/jobs/${jobId}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setJobs(jobs.filter(job => job.id !== jobId))
        } catch (err) {
            setError("Failed to delete job.")
        }
    }

    const updateStatus = async (jobId, newStatus) => {
        try {
            let response = await axios.put(`/api/v1/jobs/${jobId}/`, {
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
            saved:        "bg-slate-100 text-slate-600",
            applied:      "bg-blue-50 text-blue-700",
            interviewing: "bg-amber-50 text-amber-700",
            offer:        "bg-emerald-50 text-emerald-700",
            rejected:     "bg-red-50 text-red-600",
        }
        return styles[status] || "bg-slate-100 text-slate-600"
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
            <div className="mb-10 border-l-4 border-blue-600 pl-5">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Dashboard</h1>
                {user
                    ? <p className="text-slate-500 text-base leading-relaxed">Welcome back, <span className="text-blue-600 font-bold">{user}</span></p>
                    : <p className="text-slate-500 text-base leading-relaxed">Mission control for your civilian career.</p>
                }
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 text-center animate-pulse">
                            <div className="h-8 bg-slate-100 rounded-lg mx-auto w-10 mb-2" />
                            <div className="h-3 bg-slate-100 rounded mx-auto w-16" />
                        </div>
                    ))
                ) : (
                    [
                        { label: "Total",        value: jobs.length,                                          color: "text-slate-900" },
                        { label: "Saved",        value: jobs.filter(j => j.status === "saved").length,        color: "text-slate-500" },
                        { label: "Applied",      value: jobs.filter(j => j.status === "applied").length,      color: "text-blue-600" },
                        { label: "Interviewing", value: jobs.filter(j => j.status === "interviewing").length, color: "text-amber-600" },
                        { label: "Offers",       value: jobs.filter(j => j.status === "offer").length,        color: "text-emerald-600" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 text-center">
                            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Add New Application</h2>
                <form onSubmit={addJob} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="border border-slate-200 px-4 py-3 rounded-xl text-sm flex-1 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                        type="text"
                        placeholder="Job Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border border-slate-200 px-4 py-3 rounded-xl text-sm flex-1 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
                    >
                        Add Job
                    </button>
                </form>
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mt-3">
                        {error}
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Applications</h2>
                </div>
                {loading ? (
                    <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">Loading...</div>
                ) : jobs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">
                        No applications yet. Add your first job above.
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="flex justify-between items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">
                                    {job.company.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <Link to={`/jobs/${job.id}`} className="font-black text-slate-900 hover:text-blue-600 transition-colors text-sm">
                                        {job.company}
                                    </Link>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{job.title}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${getStatusBadge(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <select
                                    value={job.status}
                                    onChange={(e) => updateStatus(job.id, e.target.value)}
                                    className="border border-slate-200 px-2 py-1.5 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="saved">Saved</option>
                                    <option value="applied">Applied</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button
                                    onClick={() => deleteJob(job.id)}
                                    className="text-slate-300 hover:text-red-500 text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-bold"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </div>
    )
}

export default DashboardPage