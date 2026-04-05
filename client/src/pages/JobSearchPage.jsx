import { useState, useEffect } from "react"
import { useLocation, useNavigate, useOutletContext } from "react-router-dom"
import axios from "axios"

const JobSearchPage = () => {
    const routeLocation = useLocation()
    const searchParams = new URLSearchParams(routeLocation.search)
    const { token, jobSearchState, setJobSearchState } = useOutletContext()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const resultsPerPage = 10

    const { searchTerm, location, results, totalCount, page, lastSearch } = jobSearchState
    const setSearchTerm = (v) => setJobSearchState((s) => ({ ...s, searchTerm: v }))
    const setLocation = (v) => setJobSearchState((s) => ({ ...s, location: v }))
    const setResults = (v) => setJobSearchState((s) => ({ ...s, results: v }))
    const setTotalCount = (v) => setJobSearchState((s) => ({ ...s, totalCount: v }))
    const setPage = (v) => setJobSearchState((s) => ({ ...s, page: v }))
    const setLastSearch = (v) => setJobSearchState((s) => ({ ...s, lastSearch: v }))

    const fetchJobs = async (what, where, pageNum) => {
        setLoading(true)
        setError("")
        try {
            let response = await axios.get(
                `/api/v1/adzuna/search/?what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&page=${pageNum}&results_per_page=${resultsPerPage}`,
                { headers: { Authorization: `Token ${token}` } }
            )
            setResults(response.data.results ?? [])
            setTotalCount(response.data.count ?? 0)
        } catch (err) {
            setError("Search failed. Please try again.")
        }
        setLoading(false)
    }

    useEffect(() => {
        const q = searchParams.get("q")
        if (q) {
            setSearchTerm(q)
            setPage(1)
            setLastSearch({ what: q, where: "" })
            fetchJobs(q, "", 1)
        }
    }, [routeLocation.search])

    const searchJobs = async (event) => {
        event.preventDefault()
        const newPage = 1
        setPage(newPage)
        setLastSearch({ what: searchTerm, where: location })
        await fetchJobs(searchTerm, location, newPage)
    }

    const goToPage = async (newPage) => {
        setPage(newPage)
        await fetchJobs(lastSearch.what, lastSearch.where, newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const saveJob = async (job) => {
        try {
            await axios.post("/api/v1/jobs/", {
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
        <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
            <div className="mb-10 border-l-4 border-blue-600 pl-5">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Job Search</h1>
                <p className="text-slate-500 text-base max-w-xl leading-relaxed">Search live jobs from Adzuna and save them directly to your tracker.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-6">
                <form onSubmit={searchJobs} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Job title (e.g. Technical Program Manager)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-slate-200 px-4 py-3 rounded-xl text-sm flex-1 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Location (e.g. Seattle)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border border-slate-200 px-4 py-3 rounded-xl text-sm flex-1 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
                    >
                        Search
                    </button>
                </form>
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mt-3">
                        {error}
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {totalCount > 0
                            ? `${((page - 1) * resultsPerPage) + 1}–${Math.min(page * resultsPerPage, totalCount)} of ${totalCount.toLocaleString()} Results`
                            : "Results"}
                    </h2>
                </div>
                {loading ? (
                    <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">Searching...</div>
                ) : results.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-400 text-sm font-semibold">
                        No results yet. Try a search above.
                    </div>
                ) : (
                    <>
                        {results.map((job) => (
                            <div key={job.id} className="flex items-start px-5 py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0 mt-0.5">
                                    {job.company.display_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 text-sm">{job.title}</p>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{job.company.display_name}</p>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{job.location.display_name}</p>
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-4">{job.description}</p>
                                    <a
                                        href={job.redirect_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                    >
                                        View on Adzuna →
                                    </a>
                                </div>
                                <div className="flex-shrink-0 flex items-center self-center">
                                    <button
                                        onClick={() => saveJob(job)}
                                        className="bg-green-50 hover:bg-green-100 text-green-700 text-sm px-5 py-2.5 rounded-xl font-semibold transition-colors"
                                    >
                                        + Save
                                    </button>
                                </div>
                            </div>
                        ))}
                        {totalCount > resultsPerPage && (
                            <div className="px-5 py-4 flex items-center justify-between border-t border-slate-100">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                    className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    ← Prev
                                </button>
                                <span className="text-xs text-slate-500 font-semibold">
                                    Page {page} of {Math.ceil(totalCount / resultsPerPage)}
                                </span>
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= Math.ceil(totalCount / resultsPerPage)}
                                    className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
        </div>
    )
}

export default JobSearchPage